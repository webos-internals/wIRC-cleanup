function ServerAdvancedAssistant(serverInfoAssistant)
{
	this.server = serverInfoAssistant.server;
	this.onConnectData = serverInfoAssistant.onConnectData;
	this.onConnectCount =	serverInfoAssistant.onConnectCount;
	
	console.log("this server " + this.server);
	this.aliasElement =				false;
	this.addressElement =			false;
	this.portElement =				false;
	this.serverUserElement =		false;
	this.serverPasswordElement =	false;
	this.autoConnectElement =		false;
	this.autoIdentifyWrapper =		false;
	this.autoIdentifyElement =		false;
	this.identifyService =			false;
	this.identifyPassword =			false;
	this.saveButtFonElement =		false;
	this.onConnectList =			false;
	
	this.onConnectModel =	{items:[]};
	
	/*
	if (this.server.onConnect && this.server.onConnect.length > 0)
	{
		for (var c = 0; c < this.server.onConnect.length; c++)
		{
			this.onConnectCount++;
			this.onConnectData.push({id: this.onConnectCount, index: this.onConnectCount-1, value: this.server.onConnect[c]});
		}
	}
	*/
		
}

ServerAdvancedAssistant.prototype.setup = function()
{
	
	try 
	{
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, { visible: false });
		
		this.aliasElement =				this.controller.get('alias');
		this.addressElement =			this.controller.get('address');
		this.portElement =				this.controller.get('port');
		this.serverUserElement =		this.controller.get('serverUser');
		this.serverPasswordElement =	this.controller.get('serverPassword');
		this.autoConnectElement =		this.controller.get('autoConnect');
		this.autoIdentifyWrapper =		this.controller.get('autoIdentifyWrapper');
		this.autoIdentifyElement =		this.controller.get('autoIdentify');
		this.identifyServiceElement =	this.controller.get('identifyService');
		this.identifyPasswordElement =	this.controller.get('identifyPassword');
		this.onConnectList =			this.controller.get('onConnect');
		
		this.textChanged =			this.textChanged.bindAsEventListener(this);
		this.toggleChanged =		this.toggleChanged.bindAsEventListener(this);
		
		this.autoIdentifyChanged();
		this.autoIdentifyChanged =	this.autoIdentifyChanged.bindAsEventListener(this);
		
		this.controller.setupWidget
		(
			'alias',
			{
				multiline: false,
				enterSubmits: false,
				hintText: 'Optional',
				modelProperty: 'alias',
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.server
		);
		this.controller.setupWidget
		(
			'address',
			{
				multiline: false,
				enterSubmits: false,
				hintText: 'Required',
				modelProperty: 'address',
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.server
		);
		this.controller.setupWidget
		(
			'port',
			{
				multiline: false,
				enterSubmits: false,
				modelProperty: 'port',
				hintText: 'Optional',
				charsAllow: Mojo.Char.isDigit,
				modifierState: Mojo.Widget.numLock,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.server
		);
		this.controller.setupWidget
		(
			'serverUser',
			{
				multiline: false,
				enterSubmits: false,
				hintText: 'Optional',
				modelProperty: 'serverUser',
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.server
		);
		this.controller.setupWidget
		(
			'serverPassword',
			{
				multiline: false,
				enterSubmits: false,
				hintText: 'Optional',
				modelProperty: 'serverPassword',
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.server
		);
		
		this.controller.setupWidget
		(
			'autoConnect',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
				modelProperty: 'autoConnect'
			},
			this.server
		);
		
		Mojo.Event.listen(this.aliasElement,			Mojo.Event.propertyChange,	this.textChanged);
		Mojo.Event.listen(this.addressElement,			Mojo.Event.propertyChange,	this.textChanged);
		Mojo.Event.listen(this.portElement,				Mojo.Event.propertyChange,	this.textChanged);
		Mojo.Event.listen(this.serverUserElement,		Mojo.Event.propertyChange,	this.textChanged);
		Mojo.Event.listen(this.serverPasswordElement,	Mojo.Event.propertyChange,	this.textChanged);
		Mojo.Event.listen(this.autoConnectElement,		Mojo.Event.propertyChange,	this.toggleChanged);
		
		this.controller.setupWidget
		(
			'autoIdentify',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
				modelProperty: 'autoIdentify'
			},
			this.server
		);
		this.controller.setupWidget
		(
			'identifyService',
			{
				multiline: false,
				enterSubmits: false,
				modelProperty: 'identifyService',
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.server
		);
		this.controller.setupWidget
		(
			'identifyPassword',
			{
				multiline: false,
				enterSubmits: false,
				modelProperty: 'identifyPassword',
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.server
		);
		
		Mojo.Event.listen(this.autoIdentifyElement,		Mojo.Event.propertyChange,	this.autoIdentifyChanged);
		Mojo.Event.listen(this.identifyServiceElement,	Mojo.Event.propertyChange,	this.textChanged);
		Mojo.Event.listen(this.identifyPasswordElement,	Mojo.Event.propertyChange,	this.textChanged);
		
				
		
		this.onConnectBuildList();
		this.controller.setupWidget
		(
			'onConnect',
			{
				itemTemplate: "server-advanced/onConnect-row",
				swipeToDelete: true,
				reorderable: true,
				addItemLabel: 'New',
				
				multiline: false,
				enterSubmits: false,
				modelProperty: 'value',
				changeOnKeyPress: true,
			},
			this.onConnectModel
		);
		
		Mojo.Event.listen(this.onConnectList, Mojo.Event.listAdd,			this.onConnectAdd.bindAsEventListener(this));
		Mojo.Event.listen(this.onConnectList, Mojo.Event.propertyChanged,	this.onConnectChange.bindAsEventListener(this));
		Mojo.Event.listen(this.onConnectList, Mojo.Event.listReorder,		this.onConnectReorder.bindAsEventListener(this));
		Mojo.Event.listen(this.onConnectList, Mojo.Event.listDelete,		this.onConnectDelete.bindAsEventListener(this));
	} 
	catch (e) 
	{
		Mojo.Log.logException(e, 'server-advanced#setup');
	}
}

ServerAdvancedAssistant.prototype.toggleChanged = function(event)
{
	// Nothing special here, The model is being changed automatically
}
ServerAdvancedAssistant.prototype.textChanged = function(event)
{
	// test server validation
	/*
	ircServer.validateNewServer(this.server, this, false);
	*/
}

ServerAdvancedAssistant.prototype.autoIdentifyChanged = function(event)
{
	if (this.server.autoIdentify)
	{
		this.autoIdentifyWrapper.className = 'palm-row first';
		this.controller.get('identifyInfo').style.display = '';
	}
	else
	{
		this.autoIdentifyWrapper.className = 'palm-row single';
		this.controller.get('identifyInfo').style.display = 'none';
	}
}

ServerAdvancedAssistant.prototype.onConnectBuildList = function()
{
	this.onConnectModel.items = [];
	if (this.onConnectData.length > 0)
	{
		for (var d = 0; d < this.onConnectData.length; d++)
		{
			this.onConnectModel.items.push(this.onConnectData[d]);
		}
	}
}
ServerAdvancedAssistant.prototype.onConnectAdd = function(event)
{
	this.onConnectCount++;
	this.onConnectData.push({id: this.onConnectCount, index: this.onConnectData.length, value: ''});
	
	this.onConnectBuildList();
	
	this.onConnectList.mojo.noticeUpdatedItems(0, this.onConnectModel.items);
	this.onConnectList.mojo.setLength(this.onConnectModel.items.length);
	
	this.onConnectList.mojo.focusItem(this.onConnectModel.items[this.onConnectModel.items.length-1]);
	
	this.onConnectSave();
}
ServerAdvancedAssistant.prototype.onConnectChange = function(event)
{
	this.onConnectSave();
}
ServerAdvancedAssistant.prototype.onConnectReorder = function(event)
{
	for (var d = 0; d < this.onConnectData.length; d++) 
	{
		if (this.onConnectData[d].index == event.fromIndex) 
		{
			this.onConnectData[d].index = event.toIndex;
		}
		else 
		{
			if (event.fromIndex > event.toIndex) 
			{
				if (this.onConnectData[d].index < event.fromIndex &&
				this.onConnectData[d].index >= event.toIndex) 
				{
					this.onConnectData[d].index++;
				}
			}
			else if (event.fromIndex < event.toIndex) 
			{
				if (this.onConnectData[d].index > event.fromIndex &&
				this.onConnectData[d].index <= event.toIndex) 
				{
					this.onConnectData[d].index--;
				}
			}
		}
	}
	this.onConnectSave();
}
ServerAdvancedAssistant.prototype.onConnectDelete = function(event)
{
	var newData = [];
	if (this.onConnectData.length > 0) 
	{
		for (var d = 0; d < this.onConnectData.length; d++) 
		{
			if (this.onConnectData[d].id == event.item.id) 
			{
				// ignore
			}
			else 
			{
				if (this.onConnectData[d].index > event.index) 
				{
					this.onConnectData[d].index--;
				}
				newData.push(this.onConnectData[d]);
			}
		}
	}
	this.onConnectData = newData;
	this.onConnectSave();
}
ServerAdvancedAssistant.prototype.onConnectSave = function()
{
	if (this.onConnectData.length > 0) 
	{
		if (this.onConnectData.length > 1) 
		{
			this.onConnectData.sort(function(a, b)
			{
				return a.index - b.index;
			});
		}
		
		for (var i = 0; i < this.onConnectModel.items.length; i++) 
		{
			for (var d = 0; d < this.onConnectData.length; d++) 
			{
				if (this.onConnectData[d].id == this.onConnectModel.items[i].id) 
				{
					this.onConnectData[d].value = this.onConnectModel.items[i].value;
				}
			}
		}
	}
	
	/*
	this.server.onConnect = [];
	if (this.onConnectData.length > 0) 
	{
		for (var d = 0; d < this.onConnectData.length; d++) 
		{
			if (this.onConnectData[d].value) 
			{
				this.server.onConnect.push(this.onConnectData[d].value);
			}
		}
	}
	*/
}

ServerAdvancedAssistant.prototype.deactivate = function(event)
{
	this.onConnectSave();
	/*
	if (this.serverKey !== false)
	{
		servers.servers[this.serverKey].saveInfo(this.server);
	}
	*/
}

ServerAdvancedAssistant.prototype.validationError = function(error)
{
	alert('Error: ' +  error);
}

ServerAdvancedAssistant.prototype.activate = function(event)
{
}
ServerAdvancedAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.portElement,				Mojo.Event.propertyChange,	this.textChanged);
	Mojo.Event.stopListening(this.serverUserElement,		Mojo.Event.propertyChange,	this.textChanged);
	Mojo.Event.stopListening(this.serverPasswordElement,	Mojo.Event.propertyChange,	this.textChanged);
	Mojo.Event.stopListening(this.autoConnectElement,		Mojo.Event.propertyChange,	this.toggleChanged);
	
	Mojo.Event.stopListening(this.autoIdentifyElement,		Mojo.Event.propertyChange,	this.autoIdentifyChanged);
	Mojo.Event.stopListening(this.identifyServiceElement,	Mojo.Event.propertyChange,	this.textChanged);
	Mojo.Event.stopListening(this.identifyPasswordElement,	Mojo.Event.propertyChange,	this.textChanged);
	
	Mojo.Event.stopListening(this.onConnectList,			Mojo.Event.listAdd,			this.onConnectAdd.bindAsEventListener(this));
	Mojo.Event.stopListening(this.onConnectList,			Mojo.Event.propertyChanged,	this.onConnectChange.bindAsEventListener(this));
	Mojo.Event.stopListening(this.onConnectList,			Mojo.Event.listReorder,		this.onConnectReorder.bindAsEventListener(this));
	Mojo.Event.stopListening(this.onConnectList,			Mojo.Event.listDelete,		this.onConnectDelete.bindAsEventListener(this));
}