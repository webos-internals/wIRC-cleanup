function ircServer(params)
{
	this.id =				params.id;
	this.alias =			params.alias;
	this.address =			params.address;
	this.serverUser =		params.serverUser;
	this.serverPassword =	params.serverPassword;
	this.port =				params.port;
	this.autoConnect =		(params.autoConnect=='true'?true:false);
	this.autoIdentify =		(params.autoIdentify=='true'?true:false);
	this.identifyService =	params.identifyService;
	this.identifyPassword =	params.identifyPassword;
	this.onConnect =		params.onConnect;
	this.preferredNicks =	[];
	this.nextNick =			0;

	this.cmSubscription = connectionmanager.watchStatus(this.cmHandler.bindAsEventListener(this)); 
	
	this.reconnect =		true;
	this.autoReconnect =	false;
	this.timerId =			false;
	this.dcThreshold =		5000;
	this.ipAddress =		false;
	this.reconnectOnBetter = false;
	
	this.wan_state =		'';
	this.wifi_state =		''; 

	this.connected =		false;
	this.connectAction =	false; // is true when app is in the action of connecting/disconnecting
	this.channels =			[];
	this.queries =			[];
	this.nick =				false;
	this.nicks =			[];
	this.statusMessages =	[];
	
	this.sessionToken =		false;
	this.subscription =		false;
	
	this.stageName =		'status-' + this.id;
	this.stageController =	false;
	this.statusAssistant =	false;
	
	if (this.autoConnect)
	{
		this.connect();
	}
}

ircServer.prototype.newCommand = function(message)
{
	if (this.connected)
	{
		var cmdRegExp =			new RegExp(/^\/([^\s]*)[\s]*(.*)$/);
		var twoValRegExp =		new RegExp(/^([^\s]*)[\s]{0,1}(.*)$/);
		var threeValRegExp =	new RegExp(/^([^\s]*)[\s]{1}([^\s]*)[\s]{0,1}(.*)$/);
		var match = cmdRegExp.exec(message);
		if (match)
		{
			var cmd = match[1];
			var val = match[2];
			
			switch (cmd.toLowerCase())
			{
				case 'nick':
					wIRCd.nick(null, this.sessionToken, val)
					break;
						
				case 'j':
				case 'join':
					this.joinChannel(val);
					break;
					
				case 'msg':
				case 'query':
					var tmpMatch = twoValRegExp.exec(val);
					if (tmpMatch) 
					{
						this.startQuery(this.getNick(tmpMatch[1]), true, 'message', tmpMatch[2]);
					}
					break;
					
				case 'kick':
					var tmpMatch = threeValRegExp.exec(val);
					if (tmpMatch) 
					{
						tmpChan = this.getChannel(tmpMatch[1]);
						if (tmpChan)
						{
							tmpChan.kick(this.getNick(tmpMatch[2]), tmpMatch[3]);
						}
					}
					break;
					
				case 'mode':
					var tmpMatch = twoValRegExp.exec(val);
					if (tmpMatch) 
					{
						tmpChan = this.getChannel(tmpMatch[1]);
						if (tmpChan)
						{
							tmpChan.setMode(tmpMatch[2]);
						}
					}
					else
					{
						// if no 2 values, its to set user mode
					}
					break;
					
				case 'away':
					this.away(val?val:null);
					break;
					
				case 'ping':
					if (val) this.ping(val);
					break;
					
				case 'topic':
					if (val) 
					{
						var tmpMatch = twoValRegExp.exec(val);
						if (tmpMatch) 
						{
							this.topic(tmpMatch[1], tmpMatch[2]);
						} 
						else 
						{
							this.topic(val, null);
						}
					}
					break;					
					
				case 'quit':
					this.disconnect(val);
					break;
					
				default: // this could probably be left out later
					this.newMessage('status', false, 'Unknown Command: ' + cmd);
					break;
			}
		}
		else 
		{
			// no command match does nothing in status window
		}
	}
	else
	{
		this.newMessage('status', false, 'Not Connected.');
	}
}

ircServer.prototype.newMessage = function(type, nick, message)
{
	var obj =
	{
		type:		type,
		nick:		nick,
		message:	message,
		me:			this.nick.name
	};
	var newMsg = new ircMessage(obj);
	this.statusMessages.push(newMsg);
	this.updateStatusList();
}
ircServer.prototype.getStatusMessages = function(start)
{
	var returnArray = [];
	if (!start) start = 0;
	
	if (this.statusMessages.length > 0 && start < this.statusMessages.length)
	{
		for (var m = start; m < this.statusMessages.length; m++)
		{
			returnArray.push(this.statusMessages[m].getListObject());
		}
	}
	
	return returnArray;
}

ircServer.prototype.connect = function()
{
	if (!prefs.get().aiface)
	{
		var state = '';
		switch (prefs.get().piface)
		{
			case 'ppp0': state = this.wan_state; break;
			case 'eth0': state = this.wifi_state; break;
		}
		if (state == 'disconnected')
		{
			this.newMessage('type3', false, 'Preferred interface is not avaliable and use fallbacks is false... not connecting.');
			return;
		}
	}

	// load identity nick list
	this.preferredNicks = [];
	var nicks = ['nick1', 'nick2', 'nick3'];
	for (var i = 0; i < nicks.length; i++)
	{
		var nick = prefs.get()[nicks[i]];
		if (nick)
		{
			this.preferredNicks.push(nick);
		}
	}
	
	// connecting...
	this.newMessage('type3', false, 'Connecting...');
	this.connectAction = true;
	this.subscription = wIRCd.connect
	(
		this.connectionHandler.bindAsEventListener(this),
		this.address,
		this.port,
		(this.serverUser?this.serverUser:null),
		(this.serverPassword?this.serverPassword:null),
		this.preferredNicks[this.nextNick],
		prefs.get().realname,
		prefs.get().piface
	);
}

ircServer.prototype.maybeReconnect = function(network)
{
	if (network !== '1x')
	{
		this.reconnect = true;
	}

	this.disconnect();
}
ircServer.prototype.ipDiffers = function(payload)
{
	return (payload && payload.ipAddress && payload.ipAddress !== this.ipAddress);
}
ircServer.prototype.ipMatches = function(payload)
{
	return (payload && payload.ipAddress && payload.ipAddress === this.ipAddress);
}
ircServer.prototype.cmHandler = function(payload)
{

	if (!payload.returnValue)
	{
		this.interfaces['wan'] = payload.wan.state;
		this.interfaces['wifi'] = payload.wifi.state;
	}
	return;
	
	// Needs a lot of testing
	if (!payload.returnValue)
	{
		this.newMessage('status', false, 'ip ' + this.ipAddress);
		if (this.ipAddress)
		{ 
			if (!this.ipMatches(payload.wifi) && !this.ipMatches(payload.wan))
			{
				if (payload.isInternetConnectionAvailable)
				{
					if (this.timerId)
					{
						this.reconnect = true;
						this.newMessage('status', false, 'disconnecting, but mark alternate connection' + this.dcThreshold);
					}
					else
					{
						this.reconnect = false;
						this.timerId = setTimeout(this.maybeReconnect.bind(this), this.dcThreshold);
						this.newMessage('status', false, 'reconnect after threshold ' + this.dcThreshold);
					}
					return;
				}
				else
				{
					// disconnect in 5 seconds if connection doesn't come back
					this.reconnect = false;
					this.newMessage('status', false, 'disconnect after threshold ' + this.dcThreshold);
					this.timerId = setTimeout(this.disconnect.bind(this), this.dcThreshold);
				}
				return;
			}

			if (this.timerId)
			{
				clearTimeout(this.timerId);
				this.timerId = false;
			}

			if (this.reconnectOnBetter)
			{
				if (this.ipDiffers(payload.wifi))
				{
					this.maybeReconnect();
				}
				else if (this.ipDiffers(payload.wan))
				{
					this.maybeReconnect(payload.wan.network);
				}
				return;
			}
		}
		else
		{
			if (payload.isInternetConnectionAvailable)
			{
				clearTimeout(this.timerId);
				this.timerId = false;
				this.newMessage('status', false, 'connected or connect... ' + this.connected);
				this.connected || this.connect();
			}
		}

		this.newMessage('status', false, '--- CM f ---');
	}
}

ircServer.prototype.connectionHandler = function(payload)
{
	try
	{
		if (!payload.returnValue) 
		{
			if (!this.sessionToken)
			{
				this.sessionToken = payload.sessionToken;
			}

			if (payload.returnValue === 0)
			{
				this.newMessage('status', false, 'Disconnected!');
				this.subscription.cancel();
				this.ipAddress = false;
				this.connected = false;
				this.connectAction = false;
				this.removeNick(this.nick);
				if (servers.listAssistant && servers.listAssistant.controller)
				{
					servers.listAssistant.updateList();
				}
				if (this.autoReconnect && this.reconnect)
				{
					this.newMessage('status', false, 'Reconnecting...');
					this.connect();
				}
				return;
			}
			
			switch(payload.event)
			{
				case 'CONNECT':
					this.nick = this.getNick(payload.params[0]); 
					this.nick.me = true;
					
					this.connected = true;
					this.connectAction = false;
					
					if (servers.listAssistant && servers.listAssistant.controller)
					{
						servers.listAssistant.updateList();
					}
					
					// perform onconnect when mojo isn't busy
					this.runOnConnect.bind(this).defer();
					this.ipAddress = payload.ipAddress;
					
					break;
								
				case 'JOIN':
					var tmpChan = this.getChannel(payload.params[0]);
					if (tmpChan) 
					{
						var tmpNick = this.getNick(payload.origin);
						tmpNick.addChannel(tmpChan, '');
						tmpChan.newMessage('type4', false, tmpNick.name + ' (' + payload.origin.split("!")[1] + ') has joined ' + tmpChan.name);
					}
					break;
					
				case 'KICK':
					var tmpChan = this.getChannel(payload.params[0]);
					if (tmpChan) 
					{
						var tmpNick = this.getNick(payload.params[1]);
						var tmpNick2 = this.getNick(payload.origin);
						var reason = payload.params[2];
						if (tmpNick)
						{
							tmpNick.removeChannel(tmpChan); 
							if (tmpNick.me)
							{
								tmpChan.close();
								this.removeChannel(tmpChan);
							}
							tmpChan.newMessage('type10', false, tmpNick2.name + ' has kicked ' + tmpNick.name + ' from ' + payload.params[0] + ' (' + payload.params[2] + ')');
						}
					}
					break;
					
				case 'PART':
					var tmpChan = this.getChannel(payload.params[0]);
					if (tmpChan) 
					{
						var tmpNick = this.getNick(payload.origin);
						tmpNick.removeChannel(tmpChan);
						if (tmpNick.me)
						{
							this.removeChannel(tmpChan);
						}
						tmpChan.newMessage('type5', false, tmpNick.name + ' (' + payload.origin.split("!")[1] + ') has left ' + tmpChan.name + ' (' + payload.params[1] + ')');
					}
					break;
					
				case 'QUIT':
					var tmpNick = this.getNick(payload.origin);
					if (tmpNick)
					{
						for (var i = 0; i< tmpNick.channels.length; i++)
						{
							tmpNick.channels[i].newMessage('type5', false, tmpNick.name + ' has quit (' + payload.params + ')');
						}

						this.removeNick(tmpNick);
					}
				break;

				case 'PRIVMSG':
					if (payload.params[0].substr(0, 1) == '#') // it's a channel
					{
						var tmpChan = this.getChannel(payload.params[0]);
						if (tmpChan) 
						{
							var tmpNick = this.getNick(payload.origin);
							tmpNick.addChannel(tmpChan);
							tmpChan.newMessage('privmsg', tmpNick, payload.params[1]);
						}
					}
					else if (payload.params[0].toLowerCase() == this.nick.name.toLowerCase()) // it's a query
					{
						var tmpNick = this.getNick(payload.origin);
						var tmpQuery = this.getQuery(tmpNick);
						if (tmpQuery)
						{
							tmpQuery.newMessage('privmsg', tmpNick, payload.params[1]);
						}
						else
						{
							this.startQuery(tmpNick, false, 'message', payload.params[1]);
						}
					}
					break;

					
				case 'ACTION':
					if (payload.params[0].substr(0, 1) == '#') // it's a channel
					{
						var tmpChan = this.getChannel(payload.params[0]);
						if (tmpChan)
						{
							var tmpNick = this.getNick(payload.origin);
							tmpNick.addChannel(tmpChan);
							tmpChan.newMessage('type7', tmpNick, payload.params[1]);
						}
					}
					else if (payload.params[0].toLowerCase() == this.nick.name.toLowerCase()) // it's a query
					{
						var tmpNick = this.getNick(payload.origin);
						var tmpQuery = this.getQuery(tmpNick);
						if (tmpQuery)
						{
							tmpQuery.newMessage('type7', tmpNick, payload.params[1]);
						}
						else
						{
							this.startQuery(tmpNick, false, 'type7', payload.params[1]);
						}
					}
					break;
					
				case 'MODE':
					if (payload.params[0].substr(0, 1) == '#') // it's a channel
					{	
						var tmpNick = this.getNick(payload.origin);
						var tmpChan = this.getChannel(payload.params[0]);
						if (tmpChan) 
						{
							var modeNick = this.getNick(payload.params[2]);
							if (modeNick)
							{
								modeNick.updateMode(payload.params[1], tmpChan);
							}
							tmpChan.newMessage('type3', false, 'Mode ' + payload.params[0] + ' ' + payload.params[1] + ' ' + payload.params[2] + ' by ' + tmpNick.name);
						}
					}
					else
					{
						this.newMessage('type3', false, 'Mode ' + this.nick.name + ' ' + payload.params[0] + ' by ' + payload.origin);
					}
					break;
					
				case 'NOTICE':
					var tmpNick = this.getNick(payload.origin);
					if (payload.origin=='NULL')
						this.newMessage('type1', false, payload.params);
					else if (payload.params[0].substr(0, 1) == '#') // it's a channel
					{
						var tmpChan = this.getChannel(payload.params[0]);
						if (tmpChan) 
						{
							tmpChan.newMessage('type6', tmpNick, payload.params[1]);
						}
					}
					else if (payload.params[0] == this.nick.name) // it's me
					{
						this.newMessage('type6', tmpNick, payload.params[1]);
					}
					else
					{
						//if (payload.origin=='services')
							this.newMessage('type3', false, payload.params[1]);					
					}
					break;					
					
				case 'NICK':
					var tmpNick = this.getNick(payload.origin);
					if (tmpNick === this.nick)
					{
						this.newMessage('type9', false, tmpNick.name + ' is now known as ' + payload.params[0]);
					}
					tmpNick.updateNickName(payload.params[0]);
					break;
					
				case '324': // CHANNELMODEIS
					var tmpChan = this.getChannel(payload.params[1]);
					if (tmpChan)
					{
						tmpChan.channelMode(payload.params[2]);
					}
					break;

				case '1':		// WELCOME
				case '2':		// YOURHOST
				case '3':		// CREATED
				case '4':		// MYINFO
				case '5':		// BOUNCE
				case '251':		// LUSERCLIENT
				case '255':		// LUSERME
				case '265':		// ???
				case '266':		// ???
				case '250':		// ???
				case '372':		// MOTD
				case '901':		// ???
					this.newMessage('type2', false, payload.params[1]);
					break;
					
				case '253':		// LUSERUNKNOWN
				case '252':		// LUSEROP
				case '254':		// LUSERCHANNELS
				case '256':		// ADMINME
					this.newMessage('action', false, payload.params[1] + ' ' + payload.params[2]);
					break;
					
				case '305':		// NOTAWAY
				case '306':		// AWAY
					this.newMessage('action', false, payload.params[1]);
					break;
					
				case '332':		// TOPIC
					var tmpChan = this.getChannel(payload.params[1]);
					if (tmpChan) 
					{
						tmpChan.topicUpdate(payload.params[2]);
						if (tmpChan.containsNick(this.nick)) 
						{
							tmpChan.newMessage('type8', false, 'Topic for ' + payload.params[1] + ' is "' + payload.params[2] + '"');
						}
					} 
					else 
					{
						this.newMessage('type8', false, 'Topic for ' + payload.params[1] + ' is "' + payload.params[2] + '"');
					}
					break;

				case '333':		// TOPIC SET TIME
					var newDate = new Date();
					newDate.setTime(payload.params[3]*1000);
					dateString = newDate.toUTCString();
					var tmpChan = this.getChannel(payload.params[1]);
					if (tmpChan) 
					{
						if (tmpChan.containsNick(this.nick)) 
						{
							tmpChan.newMessage('type8', false, 'Topic set by ' + payload.params[2] + ' on ' + dateString);
						}
					} 
					else 
					{
						this.newMessage('action', false, 'Topic set by ' + payload.params[2] + ' on ' + dateString);
					}
					break;
					
				case 'TOPIC': 	// TOPIC CHANGED
					var tmpChan = this.getChannel(payload.params[0]);
					if (tmpChan)
					{
						var tmpNick = this.getNick(payload.origin);
						tmpChan.topicUpdate(payload.params[1]);
						tmpChan.newMessage('action', false, tmpNick&&tmpNick.name + ' changed the topic to: ' + payload.params[1]);
					}
					break;
				case '328':		// ???
				case '329':		// ???
				case '331':		// NO TOPIC
					this.debugPayload(payload, false);
					break;
				case '353':		// NAMREPLY
					var nicks = payload.params[3].split(" ");
					var tmpChan = this.getChannel(payload.params[2]);
					var tmpNick;
					if (tmpChan)
					{
						for (var i = 0; i < nicks.length; i++)
						{
							if (nicks[i])
							{
								var prefixNick = '';
								var onlyNick = nicks[i];
								if (ircNick.hasPrefix(onlyNick))
								{
									prefixNick = nicks[i].substr(0, 1);
									onlyNick = nicks[i].substr(1);
								}
								
								tmpNick = this.getNick(onlyNick);
								if (tmpNick)
								{
									tmpNick.addChannel(tmpChan, ircNick.getPrefixMode(prefixNick));
								}
							}
						}
					}
					break;
				case '366':		// ENDOFNAMES
					this.debugPayload(payload, false);
					break;
					
				case '375':		// MOTDSTART
				case '376':		// ENDOFMOTD
					//this.newMessage('action', false, payload.params[1]);
					break;
					
				case '433':		// NAMEINUSE
					this.newMessage('debug', false, payload.params[1] + " : " + payload.params[2]);
					this.nextNick = (this.nextNick < this.preferredNicks.length - 1) ? this.nextNick + 1 : 0;
					this.newMessage('debug', false, 'try next nick [' + this.nextNick + '] - ' + this.preferredNicks[this.nextNick]);
					wIRCd.nick(null, this.sessionToken, this.preferredNicks[this.nextNick])

					break;
					
				default:
					this.debugPayload(payload, true);
					break;
			}
		}
		else
		{
			// hmm
		}
		
		// for debugging all messages
		//this.debugPayload(payload, false);
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircServer#connectionHandler");
	}
}
ircServer.prototype.debugPayload = function(payload, visible)
{
	alert('------');
	for (p in payload) 
	{
		alert(p + ': ' + payload[p]);
		if (visible) 
		{
			this.newMessage('debug', false, p + ': ' + payload[p]);
		}
	}
}
ircServer.prototype.runOnConnect = function()
{
	if (this.onConnect)
	{
		var tmpSplit = this.onConnect.split(';');
		if (tmpSplit.length > 0)
		{
			for (var s = 0; s < tmpSplit.length; s++)
			{
				// also defer these commands to run one after another when its not busy
				this.newCommand.bind(this).defer(tmpSplit[s]);
			}
		}
	}
}
ircServer.prototype.away = function(reason)
{
	wIRCd.away(this.topicHandler.bindAsEventListener(this), this.sessionToken, reason);
}
ircServer.prototype.ping = function(server)
{
	wIRCd.ping(this.topicHandler.bindAsEventListener(this), this.sessionToken, server);
}
ircServer.prototype.topic = function(channel, topic)
{
	wIRCd.topic(this.topicHandler.bindAsEventListener(this), this.sessionToken, channel, topic);
}
ircServer.prototype.topicHandler = function(payload)
{
	// idk what to do here if anything
}

ircServer.prototype.disconnect = function(reason)
{
	// disconnecting...
	// TODO: Jump to server status scene and display disconnecting
	this.connectAction = true;
	if (reason)
	{
		this.reconnect = false;
		this.newMessage('status', false, 'Quitting (' + reason + ')...');
		wIRCd.quit(this.disconnectHandler.bindAsEventListener(this), this.sessionToken, reason);
	}
	else
	{
		this.newMessage('status', false, 'Disconnecting...');
		wIRCd.quit(this.disconnectHandler.bindAsEventListener(this), this.sessionToken, reason);
		//wIRCd.disconnect(null, this.sessionToken);
	}
}
ircServer.prototype.disconnectHandler = function(payload)
{
	//this.newMessage('status', false, 'dc handler');
	/*
	if (payload.returnValue == 0)
	{
		this.ipAddress = false;
		this.connected = false;
		this.connectAction = false;
		this.reconnect = false;
		this.removeNick(this.nick);
		if (servers.listAssistant && servers.listAssistant.controller)
		{
			servers.listAssistant.updateList();
		}
	}
	this.subscription.cancel();
	if (this.autoReconnect && this.reconnect)
	{
		this.connect();
	}
	*/
	//this.newMessage('status', false, 'ending dc handle');
}

ircServer.prototype.showStatusScene = function(popit)
{
	try
	{
		this.stageController = Mojo.Controller.appController.getStageController(this.stageName);
		
		if (!popit && (servers.listAssistant && servers.listAssistant.controller))
		{
	        if (this.stageController && this.stageController.activeScene().sceneName == 'server-status') 
			{
				this.stageController.activate();
			}
			else if (this.stageController && this.stageController.activeScene().sceneName != 'server-status') 
			{
				this.stageController.popScenesTo('server-status');
				this.stageController.activate();
			}
			else 
			{
				servers.listAssistant.controller.stageController.pushScene('server-status', this, false);
			}
		}
		else
		{
			if (servers.listAssistant && servers.listAssistant.controller)
			{
				if (servers.listAssistant.controller.stageController.activeScene().sceneName == 'server-status')
				{
					servers.listAssistant.controller.stageController.popScenesTo('server-list');
				}
			}
			
	        if (this.stageController && this.stageController.activeScene().sceneName == 'server-status')
			{
				this.stageController.activate();
			}
			else if (this.stageController && this.stageController.activeScene().sceneName != 'server-status')
			{
				this.stageController.popScenesTo('server-status');
				this.stageController.activate();
			}
			else
			{
				Mojo.Controller.appController.createStageWithCallback({name: this.stageName, lightweight: true}, this.showStatusStageCallback.bind(this));
			}
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircServer#showStatus");
	}
}
ircServer.prototype.showStatusStageCallback = function(controller)
{
	controller.pushScene('server-status', this, true);
}
ircServer.prototype.setStatusAssistant = function(assistant)
{
	this.statusAssistant = assistant;
}
ircServer.prototype.updateStatusList = function()
{
	if (this.statusAssistant && this.statusAssistant.controller)
	{
		this.statusAssistant.updateList();
	}
}

ircServer.prototype.joinChannel = function(name)
{
	var tmpChannel = this.getChannel(name);
	if (tmpChannel)
	{
		// Do nothing if already in this channel
		if (!tmpChannel.containsNick(this.nick))
		{
			// Open the stage and join the channel
			tmpChannel.openStage();
			tmpChannel.join();
		}
		return;
	}
	
	var newChannel = new ircChannel(
	{
		name:	name,
		server:	this
	});
	this.channels.push(newChannel);
	newChannel.join();
}
ircServer.prototype.getChannel = function(name)
{
	if (this.channels.length > 0)
	{
		for (var c = 0; c < this.channels.length; c++)
		{
			if (this.channels[c].name == name.toLowerCase())
			{
				return this.channels[c];
			}
		}
	}
	return false;
}
ircServer.prototype.removeChannel = function(channel)
{
	this.channels = this.channels.without(channel);
}

ircServer.prototype.startQuery = function(nick, started, messageType, message)
{
	// started is for if we initiated the query,
	// it should just pop the stage instead of messign with dashboard
	
	var tmpQuery = this.getQuery(nick);
	if (tmpQuery)
	{
		if (started) 
		{
			if (messageType == 'message') tmpQuery.msg(message);
			else if (messageType == 'action') tmpQuery.me(message);
			tmpQuery.openStage();
		}
		else
		{
			if (messageType == 'message') tmpQuery.newMessage('privmsg', nick, message);
			else if (messageType == 'action') tmpQuery.newMessage('action', nick, message);
		}
		return;
	}
	
	var newQuery = new ircQuery(
	{
		nick:	nick,
		server:	this
	});
	if (started) 
	{
		if (messageType == 'message') newQuery.msg(message);
		else if (messageType == 'action') newQuery.me(message);
		newQuery.openStage();
	}
	else 
	{
		if (messageType == 'message') newQuery.newMessage('privmsg', nick, message);
		else if (messageType == 'action') newQuery.newMessage('action', nick, message);
	}
	this.queries.push(newQuery);
}
ircServer.prototype.newQuery = function(name)
{
	var tmpNick = this.getNick(name);
	if (tmpNick) 
	{
		var newQuery = new ircQuery(
		{
			nick:	tmpNick,
			server:	this
		});
		this.queries.push(newQuery);
		newQuery.openStage();
	}
}
ircServer.prototype.getQuery = function(nick)
{
	if (this.queries.length > 0)
	{
		for (var q = 0; q < this.queries.length; q++)
		{
			if (this.queries[q].nick.name == nick.name)
			{
				return this.queries[q];
			}
		}
	}
	return false;
}
ircServer.prototype.removeQuery = function(query)
{
	this.queries = this.queries.without(query);
}

ircServer.prototype.getNick = function(name)
{
	try
	{
		var cmdRegExp = new RegExp(/^([^\s]*)!(.*)$/);
		var match = cmdRegExp.exec(name);
		if (match) 
		{
			var getNick = match[1];
		}
		else
		{
			var getNick = name;
		}
		
		if (this.nicks.length > 0)
		{
			for (var n = 0; n < this.nicks.length; n++)
			{
				if (this.nicks[n].name == getNick)
				{
					return this.nicks[n];
				}
			}
		}
		
		var tmpNick = new ircNick({name:getNick});
		this.nicks.push(tmpNick);
		return tmpNick;
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircServer#getNick");
	}
}
ircServer.prototype.removeNick = function(nick)
{
	if (nick)
	{
		// Remove nick from all the channels
		for (var i = 0; i < this.channels.length; i++)
		{
			this.channels[i].removeNick(nick);
		}

		// Remove nick from server list
		this.nicks = this.nicks.without(nick);
	}
}

ircServer.prototype.getListObject = function()
{
	var obj =
	{
		key:		servers.getServerArrayKey(this.id),
		id:			this.id,
		alias:		this.alias,
		address:	this.address,
		connected:	this.connected,
		spinning:	true,
		rowStyle:	''
	};
	
	if (this.connected) obj.rowStyle = obj.rowStyle + ' connected';
	else obj.rowStyle = obj.rowStyle + ' disconnected';
	
	if (this.connectAction) obj.rowStyle = obj.rowStyle + ' changing';
	
	if (this.alias == '') obj.rowStyle = obj.rowStyle + ' address-title';
	
	return obj;
}
ircServer.prototype.getEditObject = function()
{
	var obj = 
	{
		id:					this.id,
		alias:				this.alias,
		address:			this.address,
		port:				this.port,
		serverUser:			this.serverUser,
		serverPassword:		this.serverPassword,
		autoConnect:		this.autoConnect,
		autoIdentify:		this.autoIdentify,
		identifyService:	this.identifyService,
		identifyPassword:	this.identifyPassword,
		onConnect:			this.onConnect
	};
	return obj;
}

ircServer.prototype.saveInfo = function(params)
{
	if (ircServer.validateNewServer(params, false, false)) 
	{
		this.id =				params.id;
		this.alias =			params.alias;
		this.address =			params.address;
		this.serverUser =		params.serverUser;
		this.serverPassword =	params.serverPassword;
		this.port =				params.port;
		this.autoConnect =		params.autoConnect;
		this.autoIdentify =		params.autoIdentify;
		this.identifyService =	params.identifyService;
		this.identifyPassword =	params.identifyPassword;
		this.onConnect =		params.onConnect;		
		
		db.saveServer(this, this.saveInfoResponse.bind(this));
	}
}
ircServer.prototype.saveInfoResponse = function(results) {}

ircServer.getBlankServerObject = function()
{
	var obj = 
	{
		id:					false,
		alias:				'',
		address:			'',
		serverUser:			'wIRCuser',
		serverPassword:		'',
		port:				6667,
		autoConnect:		false,
		autoIdentify:		false,
		identifyService:	'NickServ',
		identifyPassword:	'',
		onConnect:			''
	};
	return obj;
}
ircServer.validateNewServer = function(params, assistant, verbose)
{
	/* 
	 * to be fleshed out so someone can't create a server with no address or something like that
	 * 
	 * how it should work:
	 * if no assistant (verbose doesn't matter) simply return a true/false
	 * if assistant and not verbose, simply highlight errors, return true/false
	 * if assistant and verbose, highlight errors and call assistant.alidationError(message), return true/false
	 * 
	 */
	
	// for now, we don't really care about you... don't screw it up!
	return true;
}
