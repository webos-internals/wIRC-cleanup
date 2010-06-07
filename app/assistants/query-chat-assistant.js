function QueryChatAssistant(query)
{
	this.query = query;
	
	this.documentElement =			false;
	this.sceneScroller =			false;
	this.titleElement =				false;
	this.messageListElement =		false;
	this.inputContainerElement =	false;
	this.inputWidgetElement =		false;
	this.inputElement =				false;
	this.sendButtonElement =		false;
	
	this.autoScroll =				true;
	this.isVisible = 				false;
	this.lastFocusMarker =			false;
	this.lastFocusMessage =			false;
	
	this.listModel =
	{
		items: []
	};
	this.inputModel =
	{
		value:''
	};
	
	this.query.setChatAssistant(this);
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items: []
	}
	this.menuModel.items.push({ label: 'Preferences',	command: 'do-prefs' });
	this.menuModel.items.push({ label: 'Clear Backlog',	command: 'clear-backlog' });
}

QueryChatAssistant.prototype.setup = function()
{
	try
	{
		// set theme
		this.controller.document.body.className = prefs.get().theme;
		
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		this.documentElement =			this.controller.stageController.document;
		this.sceneScroller =			this.controller.sceneScroller;
		this.titleElement =				this.controller.get('title');
		this.networkLagElement =		this.controller.get('networkLag');
		this.messageListElement =		this.controller.get('messageList');
		this.inputContainerElement =	this.controller.get('inputFooter');
		this.inputWidgetElement =		this.controller.get('inputWidget');
		this.sendButtonElement =		this.controller.get('sendButton');
		
		this.scrollHandler =			this.onScrollStarted.bindAsEventListener(this);
		this.visibleWindowHandler =		this.visibleWindow.bindAsEventListener(this);
		this.invisibleWindowHandler =	this.invisibleWindow.bindAsEventListener(this);
		this.dragStartHandler =	this.dragStartHandler.bindAsEventListener(this);
		this.draggingHandler =	this.draggingHandler.bindAsEventListener(this);
		this.inputChanged =				this.inputChanged.bindAsEventListener(this);
		this.inputElementLoseFocus =	this.inputFocus.bind(this);
		this.sendButtonPressed =		this.sendButtonPressed.bindAsEventListener(this);
		
		Mojo.Event.listen(this.sceneScroller,	Mojo.Event.scrollStarting,	this.scrollHandler);
		Mojo.Event.listen(this.documentElement, Mojo.Event.stageActivate,   this.visibleWindowHandler);
		Mojo.Event.listen(this.documentElement, Mojo.Event.stageDeactivate, this.invisibleWindowHandler);
		Mojo.Event.listen(this.messageListElement, Mojo.Event.dragStart, this.dragStartHandler);
		Mojo.Event.listen(this.messageListElement, Mojo.Event.dragging, this.draggingHandler);
		this.isVisible = true;
		
		this.titleElement.innerHTML = this.query.nick.name;
		this.loadPrefs(true);
		
		this.updateList(true);
		this.controller.setupWidget
		(
			'messageList',
			{
				itemTemplate: "message/message-row",
				swipeToDelete: false,
				reorderable: false,
				renderLimit: 50,
				dividerTemplate: "message/date-divider",
				dividerFunction: this.getDivider.bind(this)
			},
			this.listModel
		);
		this.revealBottom();
		
		this.controller.setupWidget
		(
			'inputWidget',
			{
				modelProperty: 'value',
				//hintText: $L('Message...'),
				inputName: 'inputElement',
				focus: false,
				multiline: true,
				enterSubmits: true,
				changeOnKeyPress: true,
				autoReplace: prefs.get().autoReplace,
				textCase: (prefs.get().autoCap ? Mojo.Widget.steModeSentenceCase : Mojo.Widget.steModeLowerCase)
			},
			this.inputModel
		);
		Mojo.Event.listen(this.inputWidgetElement, Mojo.Event.propertyChange, this.inputChanged);
		
		this.sendButtonElement.style.display = 'none';
		Mojo.Event.listen(this.sendButtonElement, Mojo.Event.tap, this.sendButtonPressed);
	}
	catch (e) 
	{
		Mojo.Log.logException(e, 'query-chat#setup');
	}
}

QueryChatAssistant.prototype.loadPrefs = function(initial)
{
	this.messageSplit = parseInt(prefs.get().messageSplit);
	this.messagesStyle = prefs.get().messagesStyle;
	this.fontSize = prefs.get().fontSize;
	this.messageListElement.className = prefs.get().messagesStyle + ' fixed-' + prefs.get().messageSplit + ' font-' + prefs.get().fontSize + (prefs.get().timeStamp == 0 ? ' hide-divider' : '');
}
QueryChatAssistant.prototype.activate = function(event)
{
	if (prefs.get().blockScreenTimeout)
		this.controller.stageController.setWindowProperties({blockScreenTimeout: prefs.get().blockScreenTimeout, setSubtleLightbar: prefs.get().dimScreen});
	this.updateLagMeter();
	this.loadPrefs();
	if (this.alreadyActivated)
	{
		this.updateList();
	}
	else
	{
		this.inputElement = this.inputWidgetElement.querySelector('[name=inputElement]');
		Mojo.Event.listen(this.inputElement, 'blur', this.inputElementLoseFocus);
	}
	this.alreadyActivated = true;
	this.revealBottom();
	this.inputWidgetElement.mojo.focus();
}
QueryChatAssistant.prototype.updateList = function(initial)
{
	try
	{
		if (initial) 
		{
			var newMessages = this.query.getMessages(0);
			if (newMessages.length > 0)
			{
				for (var m = 0; m < newMessages.length; m++) 
				{
					this.listModel.items.push(newMessages[m]);	
				}
			}
		}
		else
		{
			if (!this.isVisible && this.lastFocusMessage && !this.lastFocusMessage.hasClassName('lostFocus'))
			{
				if (this.lastFocusMarker && this.lastFocusMarker.hasClassName('lostFocus'))
				{
					this.lastFocusMarker.removeClassName('lostFocus');
					this.lastFocusMarker = false;
				}
				this.lastFocusMessage.addClassName('lostFocus');
				this.lastFocusMessage.style.borderBottomColor = prefs.get().colorMarker;
			}
			
			var start = this.messageListElement.mojo.getLength();
			var newMessages = this.query.getMessages(start);
			if (newMessages.length > 0)
			{
				for (var m = 0; m < newMessages.length; m++) 
				{
					this.listModel.items.push(newMessages[m]);	
				}
			}
			this.messageListElement.mojo.noticeUpdatedItems(start, newMessages);
			this.messageListElement.mojo.setLength(start + newMessages.length);
			this.revealBottom();
		}
		
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'query-chat#updateList');
	}
}
QueryChatAssistant.prototype.getDivider = function(item)
{
	var string = "";
	
	var pm = false;
	if (item.date.getHours() > 12) pm = true;
	
	if (!pm)
	{
		if (item.date.getHours() < 1) string += '12';
		if (item.date.getHours() > 0) string += item.date.getHours();
		string += ':';
		var mins = item.date.getMinutes();
		if (prefs.get().timeStamp == 60 || prefs.get().timeStamp == 0)
		{
			mins = 0;
		}
		else
		{
			if ((mins%prefs.get().timeStamp) > 0) mins = mins - (mins%prefs.get().timeStamp);
		}
		if (mins < 10) string += '0'
		string += mins + ' AM';
	}
	else
	{
		string += (item.date.getHours() - 12) + ':';
		var mins = item.date.getMinutes();
		if (prefs.get().timeStamp == 60 || prefs.get().timeStamp == 0)
		{
			mins = 0;
		}
		else
		{
			if ((mins%prefs.get().timeStamp) > 0) mins = mins - (mins%prefs.get().timeStamp);
		}
		if (mins < 10) string += '0'
		string += mins + ' PM';
	}
	
	return string;
}

QueryChatAssistant.prototype.onScrollStarted = function(event)
{
	event.addListener(this);
}
QueryChatAssistant.prototype.moved = function(stopped, position)
{
	if (this.sceneScroller.scrollHeight - this.sceneScroller.scrollTop > this.sceneScroller.clientHeight) 
	{
		this.autoScroll = false;
	}
	else
	{
		this.autoScroll = true;
	}
}
QueryChatAssistant.prototype.revealBottom = function()
{
	if (this.autoScroll) 
	{
		var height = this.inputContainerElement.clientHeight;
		this.messageListElement.style.paddingBottom = height + 'px';
		
		// palm does this twice in the messaging app to make sure it always reveals the very very bottom
		this.sceneScroller.mojo.revealBottom();
		this.sceneScroller.mojo.revealBottom();
	}
}

QueryChatAssistant.prototype.sendButtonPressed = function(event)
{
	this.query.newCommand(this.inputModel.value);
	this.inputWidgetElement.mojo.setValue('');
	
	// this probably isn't needed
	//this.updateList();
}
QueryChatAssistant.prototype.inputChanged = function(event)
{
	this.revealBottom();
	
	if (event.originalEvent && Mojo.Char.isEnterKey(event.originalEvent.keyCode) &&
		event.value != '') 
	{
		this.sendButtonPressed();
	}
	else
	{
		if (event.value == '') 
		{
			this.sendButtonElement.style.display = 'none';
		}
		else 
		{
			this.sendButtonElement.style.display = '';
		}
	}
}
QueryChatAssistant.prototype.inputFocus = function(event)
{
	if (this.inputElement)
	{
		this.inputElement.focus();
	}
}

QueryChatAssistant.prototype.updateLagMeter = function()
{
	var netClass = '';
	if (prefs.get().lagMeter)
	{
		if (this.query.server.isConnected())
		{
			if (this.query.server.sessionInterface == 'wan')
				netClass = 'network ' + this.query.server.sessionNetwork + ' ' + this.query.server.lag;
			else
				netClass = 'network wifi ' + this.query.server.lag;
		}
	}
	this.networkLagElement.className = netClass;
}

QueryChatAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
			case 'do-prefs':
				this.controller.stageController.pushScene('preferences-general');
				break;
				
			case 'clear-backlog':
				this.query.clearMessages();
				this.listModel.items = [];
				this.lastFocusMarker = false;
				this.lastFocusMessage = false;
				this.messageListElement.mojo.noticeUpdatedItems(0, this.listModel.items);
				this.messageListElement.mojo.setLength(0);
				break;
		}
	}
}
QueryChatAssistant.prototype.dragStartHandler = function(event)
{
	this.useScroll = false;
	this.lastY = event.move.y;
	this.lastX = event.move.x;
}
QueryChatAssistant.prototype.draggingHandler = function(event)
{
	if (this.useScroll)
	{
		return;
	}
	if (Math.abs(event.move.y - this.lastY) > 15)
	{
		this.useScroll = true;
		return;
	}
	var difference = event.move.x - this.lastX;
	while (Math.abs(difference) >= 15)
	{
		if (difference > 0)
		{
			this.lastX = event.move.x;
			this.messageSplit = this.messageSplit + 5;
			difference = difference - 15;
		}
		else if (difference < 0)
		{
			this.lastX = event.move.x;
			this.messageSplit = this.messageSplit - 5;
			difference = difference + 15;
		}
	}
	if (this.messageSplit < 15)
	{
		this.messageSplit = 15;
	}
	if (this.messageSplit > 50)
	{
		this.messageSplit = 50;
	}
	this.messageListElement.className = this.messagesStyle + ' fixed-' + this.messageSplit + ' font-' + this.fontSize + (prefs.get().timeStamp == 0 ? ' hide-divider' : '');
}
QueryChatAssistant.prototype.visibleWindow = function(event)
{
	if (!this.isVisible)
	{
		this.isVisible = true;
	}
	this.query.closeDash();
	this.updateLagMeter();
}
QueryChatAssistant.prototype.invisibleWindow = function(event)
{
	this.isVisible = false;
	
	if (this.lastFocusMessage && this.lastFocusMessage.hasClassName('lostFocus'))
	{
		this.lastFocusMarker = this.lastFocusMessage;
	}
	this.lastFocusMessage = this.messageListElement.mojo.getNodeByIndex(this.messageListElement.mojo.getLength()-1);
}

QueryChatAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.sceneScroller,		Mojo.Event.scrollStarting,	this.scrollHandler);
	Mojo.Event.stopListening(this.documentElement,		Mojo.Event.stageActivate,   this.visibleWindowHandler);
	Mojo.Event.stopListening(this.documentElement,		Mojo.Event.stageDeactivate,	this.invisibleWindowHandler);
	Mojo.Event.stopListening(this.messageListElement, Mojo.Event.dragStart, this.dragStartHandler);
	Mojo.Event.stopListening(this.messageListElement, Mojo.Event.dragging, this.draggingHandler);
	Mojo.Event.stopListening(this.inputWidgetElement,	Mojo.Event.propertyChange,	this.inputChanged);
	Mojo.Event.stopListening(this.inputElement,			'blur',						this.inputElementLoseFocus);
	Mojo.Event.stopListening(this.sendButtonElement,	Mojo.Event.tap,				this.sendButtonPressed);
}
QueryChatAssistant.prototype.deactivate = function(event)
{
	Mojo.Controller.stageController.setWindowProperties({blockScreenTimeout: false, setSubtleLightbar: true});	
}