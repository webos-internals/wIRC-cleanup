function StartupAssistant()
{
    // on first start, this message is displayed, along with the current version message from below
    this.firstMessage = $L("On First Start Message...");
	
    this.secondMessage = $L("On Every Update Message...");
	
    // on new version start
    this.newMessages =
	[
		{
			version: '0.3.0',
			log:
			[
				'No more service, Now a hybrid app (plugin/mojo), and all the changes that went along with that',
				'Tossing the main stage will now kill the entire app, including all child stages, and any connections to servers',
				'Changed how notice events and /msg commands are displayed',
				'/ns aliased to /msg NickServ',
				'/authserv aliased to /msg AuthServ',
				'Fixed /topic command bug',
				'Now handles numeric 404 event',
				'Added option to stop the screen from dimming',
				'Better random colors, they now are changed based on theme',
				'Added option to turn off join/part/quit/mode event messages',
				'Changing the theme resets message color options to be visible on the current theme',
				'Changes to app-menus on most scenes',
				'Favorite channels support',
				'Added this scene right here',
				'Relaunch bugfix',
				'More palm-dark theme updates',
				'Fixed bug in timestamps',
				'Added format options for timestamps',
				'Added standard help scene',
				'Removed old about scene',
				'Auto-prepend # to channel names if they\'re forgotten on /join',
				'Fixed bug stoping you from joining channels that didn\'t start with #'
			]
		},
		{
			version: '0.2.4',
			log:
			[
				'Merged Service and GUI to one package'
			]
		},
		{
			version: '0.1.0',
			log:
			[
				'Timestamp with Display Options',
				'Lag Meter with Options',
				'Clear Backlog Option',
				'Numerous new event handlers (particularly kick/join)',
				'Added /notice Support',
				'Alert word improvements',
				'Split Preferences Scene',
				'Better disconnect/reconnect handling',
				'Numerous UI improvements (Updated css, new and updated icons, etc)',
				'Better network indicators',
				'Saves the realServer (for instances where irc.xyzserver.com connects you to other.xyzserver.com)',
				'QuakeNet and DALnet added to pre-defined servers.',
				'Minor rewrite',
				'Fixed away/back in channel chat',
				'Theme changes affect all open wIRC cards',
				'Fixed Missing topic change notice when in a channel',
				'Fixed "Connected!" issue',
				'Max retries now functions properly',
				'Fixed occassional app close bug',
				'Better error handling',
				'Fixed broken notices',
				'Fixed disconnecting',
				'Removed manual /ping support'
			]
		},
		{
			version: '0.0.4',
			log:
			[
				'/whois Support',
				'/list Support',
				'/raw and /queue Support',
				'Fixed multiple-spaces in a row problem',
				'Random colors toggle',
				'Split highlight Foreground/Background',
				'Dynamic resizing fixed-width message style (drag your finger across the screen)',
				'Lots of changes to server-info scene',
				'Fixed sending keys with /join commands',
				'Added connect button to not-connected server-status scene',
				'Nicklist dropdown in server info from identity scene',
				'Added Preconfigured Servers scene, and some initial networks',
				'Made identity scene the first scene on initial run',
				'Options about how to handle channel invites',
				'Channel invite dashboard notification to accept or decline',
				'New, Awesome nick list',
				'Added away/back menu option',
				'Changed when channel stages are popped',
				'Removed Mojo.Format.runTextIndexer',
				'Fixed channel header tap topic bug'
			]
		},
		{
			version: '0.0.3',
			log:
			[
				'Initial Public Beta Release'
			]
		}
	];
	
	// random continue button message
	this.randomContinue = 
	[
		{weight: 30, text: $L("Ok, I've read this. Let's continue ...")},
		{weight: 10, text: $L("Yeah, Yeah, Whatever ...")}
	];
	
    // setup menu
    this.menuModel =
	{
	    visible: true,
	    items:
	    [
			{
				label: "Help",
				command: 'do-help'
			}
	     ]
	};
	
    // setup command menu
    this.cmdMenuModel =
	{
	    visible: false, 
	    items:
	    [
		    {},
		    {
				label: this.getRandomContinueMessage(),
				command: 'do-continue'
		    },
		    {}
	     ]
	};
};

StartupAssistant.prototype.setup = function()
{
	// set theme
	this.controller.document.body.className = prefs.get().theme;
	
    // get elements
    this.titleContainer = this.controller.get('title');
    this.dataContainer =  this.controller.get('data');
	
    // set title
    if (vers.isFirst) 
	{
	    this.titleContainer.innerHTML = $L("Welcome To wIRC");
	}
    else if (vers.isNew) 
	{
	    this.titleContainer.innerHTML = $L("wIRC Changelog");
	}
	
	
    // build data
    var html = '';
    if (vers.isFirst)
	{
	    html += '<div class="text">' + this.firstMessage + '</div>';
	}
    if (vers.isNew)
	{
	    html += '<div class="text">' + this.secondMessage + '</div>';
	    for (var m = 0; m < this.newMessages.length; m++)
		{
		    html += Mojo.View.render({object: {title: 'v' + this.newMessages[m].version}, template: 'startup/changeLog'});
		    html += '<ul class="changelog">';
		    for (var l = 0; l < this.newMessages[m].log.length; l++)
			{
			    html += '<li>' + this.newMessages[m].log[l] + '</li>';
			}
		    html += '</ul>';
		}
	}
	
    // set data
    this.dataContainer.innerHTML = html;
	
	
    // setup menu
    this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
    // set command menu
    this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'no-fade' }, this.cmdMenuModel);
	
    // set this scene's default transition
    this.controller.setDefaultTransition(Mojo.Transition.zoomFade);
};

StartupAssistant.prototype.getRandomContinueMessage = function()
{
	// loop to get total weight value
	var weight = 0;
	for (var r = 0; r < this.randomContinue.length; r++)
	{
		weight += this.randomContinue[r].weight;
	}
	
	// random weighted value
	var rand = Math.floor(Math.random() * weight);
	
	// loop through to find the random title
	for (var r = 0; r < this.randomContinue.length; r++)
	{
		if (rand <= this.randomContinue[r].weight)
		{
			return this.randomContinue[r].text;
		}
		else
		{
			rand -= this.randomContinue[r].weight;
		}
	}
	
	// if no random title was found (for whatever reason, wtf?) return first and best subtitle
	return this.randomContinue[0].text;
}

StartupAssistant.prototype.activate = function(event)
{
    // start continue button timer
    this.timer = this.controller.window.setTimeout(this.showContinue.bind(this), 5 * 1000);
};
StartupAssistant.prototype.showContinue = function()
{
    // show the command menu
    this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
};
StartupAssistant.prototype.handleCommand = function(event)
{
    if (event.type == Mojo.Event.command)
	{
	    switch (event.command)
		{
			case 'do-continue':
				if (prefs.get().realname.length==0 || prefs.get().nicknames.length==0)
					this.controller.stageController.swapScene({name: 'identity', transition: Mojo.Transition.crossFade}, true, true);
				else
					this.controller.stageController.swapScene({name: 'server-list', transition: Mojo.Transition.crossFade});
			
				break;
				
			case 'do-help':
				this.controller.stageController.pushScene('help');
				break;		
		}
	}
};
