function PreferencesAssistant()
{
	// setup default preferences in the prefCookie.js model
	this.cookie = new prefCookie();
	this.prefs = this.cookie.get();
	
	// for secret group
	this.secretString = '';
	this.secretAnswer = 'iknowwhatimdoing';
	
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
	}
}

PreferencesAssistant.prototype.setup = function()
{
	try
	{
		// setup menu
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		// set this scene's default transition
		this.controller.setDefaultTransition(Mojo.Transition.zoomFade);
		
		// setup handlers for preferences
		this.toggleChangeHandler = this.toggleChanged.bindAsEventListener(this);
		this.sliderChangeHandler = this.sliderChanged.bindAsEventListener(this);
		this.listChangedHandler  = this.listChanged.bindAsEventListener(this);
		
		// Global Group
		this.controller.setupWidget
		(
			'theme',
			{
				label: 'Theme',
				choices:
				[
					{label:'Palm Default',	value:'palm-default'},
					{label:'Palm Dark',		value:'palm-dark'}
				],
				modelProperty: 'theme'
			},
			this.prefs
		);
		
		this.controller.listen('theme',	Mojo.Event.propertyChange, this.themeChanged.bindAsEventListener(this));
		
		
		
		// Server Status Group
		this.controller.setupWidget
		(
			'statusPop',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
	  			fieldName:  'statusPop'
			},
			{
				value : this.prefs.statusPop,
	 			disabled: false
			}
		);
		
		this.controller.listen('statusPop',	Mojo.Event.propertyChange, this.toggleChangeHandler);
		
		
		
		// Input Group
		this.controller.setupWidget
		(
			'tabSuffix',
			{
				label: 'Tab Complete',
				choices:
				[
					{label:':',	value:':'},
					{label:'-',	value:'-'},
					{label:'+',	value:'+'},
					{label:'>',	value:'>'},
					{label:'|',	value:'|'},
					{label:',',	value:','},
					{label:'~',	value:'~'},
					{label:'=',	value:'='},
					{label:'?',	value:'?'},
					{label:'*',	value:'*'},
					{label:'^',	value:'^'},
					{label:'`',	value:'`'},
					{label:'"',	value:'"'},
					{label:"'",	value:"'"},
					{label:'#',	value:'#'},
					{label:'@',	value:'@'},
					{label:'/',	value:'/'},
					{label:'!',	value:'!'},
					{label:'\\',value:'\\'}
				],
				modelProperty: 'tabSuffix'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'highlight',
			{
				label: 'Highlight',
				choices:
				[
{label:'aliceblue',value:'aliceblue'},                                                                                   
{label:'antiquewhite',value:'antiquewhite'},                                                                             
{label:'aqua',value:'aqua'},                                                                                             
{label:'aquamarine',value:'aquamarine'},                                                                                 
{label:'azure',value:'azure'},                                                                                           
{label:'beige',value:'beige'},                                                                                           
{label:'bisque',value:'bisque'},                                                                                         
{label:'black',value:'black'},                                                                                           
{label:'blanchedalmond',value:'blanchedalmond'},                                                                         
{label:'blue',value:'blue'},                                                                                             
{label:'blueviolet',value:'blueviolet'},                                                                                 
{label:'brown',value:'brown'},                                                                                           
{label:'burlywood',value:'burlywood'},                                                                                   
{label:'cadetblue',value:'cadetblue'},                                                                                   
{label:'chartreuse',value:'chartreuse'},                                                                                 
{label:'chocolate',value:'chocolate'},                                                                                   
{label:'coral',value:'coral'},                                                                                           
{label:'cornflowerblue',value:'cornflowerblue'},                                                                         
{label:'cornsilk',value:'cornsilk'},                                                                                     
{label:'crimson',value:'crimson'},                                                                                       
{label:'cyan',value:'cyan'},                                                                                             
{label:'darkblue',value:'darkblue'},                                                                                     
{label:'darkcyan',value:'darkcyan'},                                                                                     
{label:'darkgoldenrod',value:'darkgoldenrod'},                                                                           
{label:'darkgray',value:'darkgray'},                                                                                     
{label:'darkgreen',value:'darkgreen'},                                                                                   
{label:'darkkhaki',value:'darkkhaki'},                                                                                   
{label:'darkmagenta',value:'darkmagenta'},                                                                               
{label:'darkolivegreen',value:'darkolivegreen'},                                                                         
{label:'darkorange',value:'darkorange'},                                                                                 
{label:'darkorchid',value:'darkorchid'},                                                                                 
{label:'darkred',value:'darkred'},                                                                                       
{label:'darksalmon',value:'darksalmon'},                                                                                 
{label:'darkseagreen',value:'darkseagreen'},                                                                             
{label:'darkslateblue',value:'darkslateblue'},                                                                           
{label:'darkslategray',value:'darkslategray'},                                                                           
{label:'darkturquoise',value:'darkturquoise'},                                                                           
{label:'darkviolet',value:'darkviolet'},                                                                                 
{label:'deeppink',value:'deeppink'},                                                                                     
{label:'deepskyblue',value:'deepskyblue'},                                                                               
{label:'dimgray',value:'dimgray'},                                                                                       
{label:'dodgerblue',value:'dodgerblue'},                                                                                 
{label:'firebrick',value:'firebrick'},                                                                                   
{label:'floralwhite',value:'floralwhite'},                                                                               
{label:'forestgreen',value:'forestgreen'},                                                                               
{label:'fuchsia',value:'fuchsia'},                                                                                       
{label:'gainsboro',value:'gainsboro'},                                                                                   
{label:'ghostwhite',value:'ghostwhite'},                                                                                 
{label:'gold',value:'gold'},                                                                                             
{label:'goldenrod',value:'goldenrod'},                                                                                   
{label:'gray',value:'gray'},                                                                                             
{label:'green',value:'green'},                                                                                           
{label:'greenyellow',value:'greenyellow'},                                                                               
{label:'honeydew',value:'honeydew'},                                                                                     
{label:'hotpink',value:'hotpink'},                                                                                       
{label:'indianred',value:'indianred'},                                                                                   
{label:'indigo',value:'indigo'},                                                                                         
{label:'ivory',value:'ivory'},                                                                                           
{label:'khaki',value:'khaki'},                                                                                           
{label:'lavender',value:'lavender'},                                                                                     
{label:'lavenderblush',value:'lavenderblush'},                                                                           
{label:'lawngreen',value:'lawngreen'},                                                                                   
{label:'lemonchiffon',value:'lemonchiffon'},                                                                             
{label:'lightblue',value:'lightblue'},                                                                                   
{label:'lightcoral',value:'lightcoral'},                                                                                 
{label:'lightcyan',value:'lightcyan'},                                                                                   
{label:'lightgoldenrodyellow',value:'lightgoldenrodyellow'},                                                             
{label:'lightgreen',value:'lightgreen'},                                                                                 
{label:'lightpink',value:'lightpink'},                                                                                   
{label:'lightsalmon',value:'lightsalmon'},                                                                               
{label:'lightseagreen',value:'lightseagreen'},                                                                           
{label:'lightskyblue',value:'lightskyblue'},                                                                             
{label:'lightslategray',value:'lightslategray'},                                                                         
{label:'lightsteelblue',value:'lightsteelblue'},                                                                         
{label:'lightyellow',value:'lightyellow'},                                                                               
{label:'lime',value:'lime'},                                                                                             
{label:'limegreen',value:'limegreen'},                                                                                   
{label:'linen',value:'linen'},                                                                                           
{label:'magenta',value:'magenta'},                                                                                       
{label:'maroon',value:'maroon'},                                                                                         
{label:'mediumaquamarine',value:'mediumaquamarine'},                                                                     
{label:'mediumblue',value:'mediumblue'},                                                                                 
{label:'mediumorchid',value:'mediumorchid'},                                                                             
{label:'mediumpurple',value:'mediumpurple'},                                                                             
{label:'mediumseagreen',value:'mediumseagreen'},                                                                         
{label:'mediumslateblue',value:'mediumslateblue'},                                                                       
{label:'mediumspringgreen',value:'mediumspringgreen'},                                                                   
{label:'mediumturquoise',value:'mediumturquoise'},                                                                       
{label:'mediumvioletred',value:'mediumvioletred'},
{label:'midnightblue',value:'midnightblue'},
{label:'mintcream',value:'mintcream'},
{label:'mistyrose',value:'mistyrose'},
{label:'moccasin',value:'moccasin'},
{label:'navajowhite',value:'navajowhite'},
{label:'navy',value:'navy'},
{label:'oldlace',value:'oldlace'},
{label:'olive',value:'olive'},
{label:'olivedrab',value:'olivedrab'},
{label:'orange',value:'orange'},
{label:'orangered',value:'orangered'},
{label:'orchid',value:'orchid'},
{label:'palegoldenrod',value:'palegoldenrod'},
{label:'palegreen',value:'palegreen'},
{label:'paleturquoise',value:'paleturquoise'},
{label:'palevioletred',value:'palevioletred'},
{label:'papayawhip',value:'papayawhip'},
{label:'peachpuff',value:'peachpuff'},
{label:'peru',value:'peru'},
{label:'pink',value:'pink'},
{label:'plum',value:'plum'},
{label:'powderblue',value:'powderblue'},
{label:'purple',value:'purple'},
{label:'red',value:'red'},
{label:'rosybrown',value:'rosybrown'},
{label:'royalblue',value:'royalblue'},
{label:'saddlebrown',value:'saddlebrown'},
{label:'salmon',value:'salmon'},
{label:'sandybrown',value:'sandybrown'},
{label:'seagreen',value:'seagreen'},
{label:'seashell',value:'seashell'},
{label:'sienna',value:'sienna'},
{label:'silver',value:'silver'},
{label:'skyblue',value:'skyblue'},
{label:'slateblue',value:'slateblue'},
{label:'slategray',value:'slategray'},
{label:'snow',value:'snow'},
{label:'springgreen',value:'springgreen'},
{label:'steelblue',value:'steelblue'},
{label:'tan',value:'tan'},
{label:'teal',value:'teal'},
{label:'thistle',value:'thistle'},
{label:'tomato',value:'tomato'},
{label:'turquoise',value:'turquoise'},
{label:'violet',value:'violet'},
{label:'wheat',value:'wheat'},
{label:'white',value:'white'},
{label:'whitesmoke',value:'whitesmoke'},
{label:'yellow',value:'yellow'},
{label:'yellowgreen',value:'yellowgreen'}
				],
				modelProperty: 'highlight'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'autoCap',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
	  			fieldName:  'autoCap'
			},
			{
				value : this.prefs.autoCap,
	 			disabled: false
			}
		);
		this.controller.setupWidget
		(
			'autoReplace',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
	  			fieldName:  'autoReplace'
			},
			{
				value : this.prefs.autoReplace,
	 			disabled: false
			}
		);
		
		this.controller.listen('tabSuffix',		Mojo.Event.propertyChange, this.listChangedHandler);
		this.controller.listen('highlight',		Mojo.Event.propertyChange, this.toggleChangeHandler);
		this.controller.listen('autoCap',		Mojo.Event.propertyChange, this.toggleChangeHandler);
		this.controller.listen('autoReplace',	Mojo.Event.propertyChange, this.toggleChangeHandler);
		
		
		
		// Messages Group
		this.controller.setupWidget
		(
			'messagesStyle',
			{
				label: 'Message Style',
				choices:
				[
					{label:'Left Aligned',	value:'lefta'}, // 'left' is special and adds padding we don't want
					{label:'Fixed Columns',	value:'fixed'}
				],
				modelProperty: 'messagesStyle'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'messageSplit',
			{
				label: 'Fixed Split',
				choices:
				[
					{label:'15% / 85%',	value:'15'},
					{label:'20% / 80%',	value:'20'},
					{label:'25% / 75%',	value:'25'},
					{label:'30% / 70%',	value:'30'},
					{label:'35% / 65%',	value:'35'},
					{label:'40% / 60%',	value:'40'},
					{label:'45% / 55%',	value:'45'},
					{label:'50% / 50%',	value:'50'},
				],
				modelProperty: 'messageSplit'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'fontSize',
			{
				minValue: 0,
				maxValue: 1,
				round: false,
				modelProperty: 'value'
			},
			{
				value: this.sliderGetSlideValue(9, 22, this.prefs.fontSize)
			}
		);
		
		this.messageStyleChanged();
		this.fontSizeChanged({value: this.sliderGetSlideValue(9, 22, this.prefs.fontSize)});
		
		this.controller.listen('messagesStyle',	Mojo.Event.propertyChange, this.messageStyleChanged.bindAsEventListener(this));
		this.controller.listen('messageSplit',	Mojo.Event.propertyChange, this.listChangedHandler);
		this.controller.listen('fontSize',		Mojo.Event.propertyChange, this.fontSizeChanged.bindAsEventListener(this));
		
		
		
		// hide secret group
		this.controller.get('secretPreferences').style.display = 'none';
		
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'preferences#setup');
	}

}

PreferencesAssistant.prototype.toggleChanged = function(event)
{
	this.prefs[event.target.id] = event.value;
	this.cookie.put(this.prefs);
}
PreferencesAssistant.prototype.sliderChanged = function(event)
{
	this.cookie.put(this.prefs);
}
PreferencesAssistant.prototype.listChanged = function(event)
{
	this.cookie.put(this.prefs);
}

PreferencesAssistant.prototype.themeChanged = function(event)
{
	// set the theme right away with the body class
	this.controller.document.body.className = event.value;
	this.listChanged();
}
PreferencesAssistant.prototype.messageStyleChanged = function(event)
{
	if (event) 
	{
		this.listChanged();
	}
	if (this.prefs['messagesStyle'] == 'lefta')
	{
		this.controller.get('messageFixedSplit').style.display = 'none';
	}
	else
	{
		this.controller.get('messageFixedSplit').style.display = '';
	}
}

PreferencesAssistant.prototype.sliderGetPrefValue = function(min, max, slider)
{
	return Math.round(min + (slider * (max - min)));
}
PreferencesAssistant.prototype.sliderGetSlideValue = function(min, max, pref)
{
	return ((pref - min) / (max - min));
}

PreferencesAssistant.prototype.fontSizeChanged = function(event)
{
	var value = this.sliderGetPrefValue(9, 22, event.value);
	
	this.controller.get('fontSizeTest').innerHTML = 'Size ' + value + ' Preview';
	this.controller.get('fontSizeTest').style.fontSize = value + 'px';
	
	this.prefs['fontSize'] = value;
	this.sliderChanged();
}

PreferencesAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
			case 'do-help':
				this.controller.stageController.pushScene('help');
				break;
		}
	}
}

PreferencesAssistant.prototype.keyPress = function(event)
{
	this.secretString += String.fromCharCode(event.originalEvent.charCode);
	
	if (event.originalEvent.charCode == 8)
	{
		this.secretString = '';
	}
	
	if (this.secretString.length == this.secretAnswer.length)
	{
		if (this.secretString === this.secretAnswer)
		{
			//this.controller.get('secretPreferences').style.display = '';
			//this.controller.getSceneScroller().mojo.revealElement(this.controller.get('secretPreferences'));
			this.secretString = '';
		}
	}
	else if (this.secretString.length > this.secretAnswer.length)
	{
		this.secretString = '';
	}
}

PreferencesAssistant.prototype.activate = function(event) {}

PreferencesAssistant.prototype.deactivate = function(event)
{
	// reload global storage of preferences when we get rid of this stage
	var tmp = prefs.get(true);
}

PreferencesAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening('theme',			Mojo.Event.propertyChange, this.themeChanged.bindAsEventListener(this));
	this.controller.stopListening('statusPop',		Mojo.Event.propertyChange, this.toggleChangeHandler);
	this.controller.stopListening('tabSuffix',		Mojo.Event.propertyChange, this.toggleChangeHandler);
	this.controller.stopListening('highlight',		Mojo.Event.propertyChange, this.toggleChangeHandler);
	this.controller.stopListening('autoCap',		Mojo.Event.propertyChange, this.toggleChangeHandler);
	this.controller.stopListening('autoReplace',	Mojo.Event.propertyChange, this.toggleChangeHandler);
	this.controller.stopListening('messagesStyle',	Mojo.Event.propertyChange, this.messageStyleChanged.bindAsEventListener(this));
	this.controller.stopListening('messageSplit',	Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('fontSize',		Mojo.Event.propertyChange, this.fontSizeChanged.bindAsEventListener(this));
}
