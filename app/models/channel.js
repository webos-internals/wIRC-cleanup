function ircChannel(params)
{
	this.name =				params.name;
	this.server =			params.server;
	this.nicks = [];
	
	this.messages =			[];
	
	this.mode = 			'';
	
	this.stageName =		'channel-' + this.server.id + '-' + this.name;
	this.stageController =	false;
	this.chatAssistant =	false;
}

ircChannel.prototype.addNick = function(nick)
{
	if (this.nicks.indexOf(nick) === -1)
	{
		this.nicks.push(nick);
	}
}

ircChannel.prototype.removeNick = function(nick)
{
	if (this.nicks.indexOf(nick) !== -1)
	{
		this.nicks = this.nicks.without(nick);
	}
}

ircChannel.prototype.getNick = function(tabText, nick)
{
	var start = this.nicks.indexOf(nick) + 1;
	
	if (!tabText)
	{
		return nick;
	}

	for (var i = start; i < this.nicks.length; i++)
	{
		if (this.nicks[i].name.toLowerCase().startsWith(tabText.toLowerCase()))
		{
			return this.nicks[i];
		}
	}

	if (start > 0)
	{
		for (var i = 0; i < start; i++)
		{
			if (this.nicks[i].name.toLowerCase().startsWith(tabText.toLowerCase()))
			{
				return this.nicks[i]
			}
		}
	}

	return false;
}

ircChannel.prototype.newCommand = function(message)
{
	var cmdRegExp = new RegExp(/^\/([^\s]*)[\s]*(.*)$/);
	var match = cmdRegExp.exec(message);
	if (match)
	{
		var cmd = match[1];
		var val = match[2];
		
		switch(cmd.toLowerCase())
		{
			case 'part':
				this.part();
				break;
				
			case 'me':
				this.me(val);
				break;
				
			default:
				// forward unknown to the server object
				this.server.newCommand(message);
				break;
		}
	}
	else
	{
		// normal message
		this.msg(message);
	}
}

ircChannel.prototype.me = function(message)
{
	wIRCd.me(this.meHandler.bindAsEventListener(this), this.server.sessionToken, this.name, message);
	this.newAction(this.server.nick, message);
}
ircChannel.prototype.meHandler = function(payload)
{
	// this apparently doesn't return anything of importance
}

ircChannel.prototype.msg = function(message)
{
	wIRCd.msg(this.msgHandler.bindAsEventListener(this), this.server.sessionToken, this.name, message);
	this.newMessage(this.server.nick, message);
}
ircChannel.prototype.msgHandler = function(payload)
{
	// this apparently doesn't return anything of importance
}

ircChannel.prototype.newMessage = function(nick, message)
{
	var m = new ircMessage({type:'channel-message', nick:nick, message:message});
	this.messages.push(m);
	this.updateChatList();
}
ircChannel.prototype.newPersonalMessage = function(nick, message)
{
	var m = new ircMessage({type:'personal-message', nick:nick, message:message});
	this.messages.push(m);
	this.updateChatList();
}
ircChannel.prototype.newNotice = function(nick, message)
{
	var m = new ircMessage({type:'channel-notice', nick:nick, message:message});
	this.messages.push(m);
	this.updateChatList();
}
ircChannel.prototype.newAction = function(nick, message)
{
	var m = new ircMessage({type:'channel-action', nick:nick, message:message});
	this.messages.push(m);
	this.updateChatList();
}
ircChannel.prototype.newStatusMessage = function(message)
{
	var m = new ircMessage({type:'status', message:message});
	this.messages.push(m);
	this.updateChatList();
}
ircChannel.prototype.newEventMessage = function(message)
{
	var m = new ircMessage({type:'channel-event', message:message});
	this.messages.push(m);
	this.updateChatList();
}
ircChannel.prototype.newDebugMessage = function(message)
{
	var m = new ircMessage({type:'debug', message:message});
	this.messages.push(m);
	this.updateChatList();
}
ircChannel.prototype.getMessages = function(start)
{
	var returnArray = [];
	if (!start) start = 0;
	
	if (this.messages.length > 0 && start < this.messages.length)
	{
		for (var m = start; m < this.messages.length; m++)
		{
			returnArray.push(this.messages[m].getListObject());
		}
	}
	
	return returnArray;
}

ircChannel.prototype.getNicks = function()
{
	try
	{
		var returnArray = [];
		
		if (this.server.nicks.length > 0)
		{
			for (var n = 0; n < this.server.nicks.length; n++)
			{
				if (this.server.nicks[n].channels.indexOf(this) > -1) 
				{
					returnArray.push(this.server.nicks[n].getListObject(this));
				}
			}
		}
		
		return returnArray;
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircChannel#getNick");
	}
}

ircChannel.prototype.join = function()
{
	wIRCd.join(this.joinHandler.bindAsEventListener(this), this.server.sessionToken, this.name);
	wIRCd.channel_mode(this.channelModeHandler.bindAsEventListener(this), this.server.sessionToken, this.name, null);
}
ircChannel.prototype.joinHandler = function(payload)
{
	if (payload.returnValue == 0)
	{
		this.openStage();
	}
}

ircChannel.prototype.channelMode = function(mode)
{
	this.mode = mode;
	this.chatAssistant.updateTitle();
}
ircChannel.prototype.channelModeHandler = function(payload)
{
	if (payload.returnValue == 0)
	{
		// Do something ?
	}
}

ircChannel.prototype.part = function()
{
	wIRCd.part(this.partHandler.bindAsEventListener(this), this.server.sessionToken, this.name);
}
ircChannel.prototype.partHandler = function(payload)
{
	if (payload.returnValue == 0)
	{
		if (this.chatAssistant && this.chatAssistant.controller)
		{
			this.chatAssistant.controller.window.close();
		}
	}
}

ircChannel.prototype.openStage = function()
{
	try
	{
		this.stageController = Mojo.Controller.appController.getStageController(this.stageName);
	
        if (this.stageController) 
		{
			if (this.stageController.activeScene().sceneName == 'channel-chat') 
			{
				this.stageController.activate();
			}
			else
			{
				this.stageController.popScenesTo('channel-chat');
				this.stageController.activate();
			}
		}
		else
		{
			Mojo.Controller.appController.createStageWithCallback({name: this.stageName, lightweight: true}, this.openStageCallback.bind(this));
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircChannel#openStage");
	}
}
ircChannel.prototype.openStageCallback = function(controller)
{
	controller.pushScene('channel-chat', this);
}
ircChannel.prototype.setChatAssistant = function(assistant)
{
	this.chatAssistant = assistant;
}
ircChannel.prototype.updateChatList = function()
{
	if (this.chatAssistant && this.chatAssistant.controller)
	{
		this.chatAssistant.updateList();
	}
}
