enyo.kind({
	name: 'wirc.ServerPreferencesPanel',
	kind: 'wirc.SlidingView',
	
	published: {
		setup: ''
	},
	
	components: [
	
		{name: 'header', layoutKind: 'VFlexLayout', kind: 'Header', style: 'margin-bottom: -1px;', components: [{name: 'headerText', content: ''}]},
		{name: 'tabs', kind: 'TabGroup', onChange: 'tabToggle', value: 'general', components: [
			{content: 'General', value: 'general'},
			{content: 'Advanced', value: 'advanced'},
		]},
		{kind: 'HeaderShadow'},
		
    	{name: 'scroller', kind: 'Scroller', className: 'scroller', flex: 1, autoVertical: true, components: [
			
			{name: 'generalTab', layoutKind: 'VFlexLayout', align: 'center', components: [
			
				{kind: 'RowGroup', width: '400px', caption: 'Server Information', components: [
					{name: 'alias', hint: 'Optional', kind: 'Input', components: [{content: 'Alias'}]},
					{name: 'address', hint: 'Required', kind: 'Input', components: [{content: 'Address'}],
						changeOnInput: true, onchange: 'requiredTest'},
					{name: 'port', hint: 'Optional', kind: 'Input', components: [{content: 'Port'}]},
					{name: 'user', hint: 'Optional', kind: 'Input', components: [{content: 'User'}]},
					{name: 'password', hint: 'Optional', kind: 'PasswordInput', components: [{content: 'Password'}]},
					{name: 'ssl', kind: 'ToggleButton', components: [{flex: 1}, {content: 'SSL'}]},
				]},
				
				{kind: 'RowGroup', width: '400px', caption: 'User Information', components: [
					{name: 'realname', hint: 'Optional', kind: 'Input', components: [{content: 'Real Name'}]},
					{name: 'nick1', hint: 'Required', kind: 'Input', components: [{content: 'Primary Nick Name'}],
						changeOnInput: true, onchange: 'requiredTest'},
					{name: 'nick2', hint: 'Optional', kind: 'Input', components: [{content: 'Secondary Nick Name'}]},
					{name: 'nick3', hint: 'Optional', kind: 'Input', components: [{content: 'Tertiary Nick Nname'}]},
				]},
			
			]},
			
			{name: 'advancedTab', layoutKind: 'VFlexLayout', align: 'center', components: [
			
				{kind: 'RowGroup', width: '400px', caption: 'foo', components: [
					{name: 'autoconnect', kind: 'ToggleButton', components: [{flex: 1}, {content: 'Auto Connect'}]},
					{name: 'autoreconnect', kind: 'ToggleButton', components: [{flex: 1}, {content: 'Auto Reconnect'}]}
				]},
				
				{kind: 'Group', width: '400px', caption: 'Perform On Connect', components: [
					{name: 'onconnect', kind: 'wi.InputList', inputHint: '/Command'},
				]},
				
			]},
			
		]},
		
		{kind: 'ToolbarShadow'},
		{name: 'toolbar', kind: 'Toolbar', className: 'enyo-toolbar-light toolbar', components: [
			{kind: 'GrabButton'},
			{kind: 'Spacer'},
			{name: 'cancelButton', kind: 'Button', width: '100px', caption: 'Cancel', onclick: 'cancelButton', className: 'enyo-button-negative'},
			{name: 'saveButton',   kind: 'Button', width: '200px', caption: '',       onclick: 'saveButton',   className: 'enyo-button-affirmative'},
			{kind: 'Spacer'},
		]},
		
	],
	
	create: function() {
	    this.inherited(arguments);
		
		this.tabToggle();
		
		if (!this.setup) {
			this.setup = enyo.clone(wirc.Server.defaultSetup);
			this.$.saveButton.setContent('Add');
			this.$.saveButton.setDisabled(true);
			this.$.headerText.setContent('Add New Server');
		}
		else {
			this.$.saveButton.setContent('Save');
			this.$.headerText.setContent('Edit Server');
		}
		
		this.$.alias.setValue(this.setup.alias);
		this.$.address.setValue(this.setup.address);
		if (this.setup.nicks && this.setup.nicks[0]) this.$.nick1.setValue(this.setup.nicks[0]);
		if (this.setup.nicks && this.setup.nicks[1]) this.$.nick2.setValue(this.setup.nicks[1]);
		if (this.setup.nicks && this.setup.nicks[2]) this.$.nick3.setValue(this.setup.nicks[2]);
		this.$.port.setValue(this.setup.port);
		this.$.user.setValue(this.setup.user);
		this.$.password.setValue(this.setup.password);
		this.$.realname.setValue(this.setup.realname);
		this.$.ssl.setState(this.setup.ssl);
		this.$.autoconnect.setState(this.setup.autoconnect);
		this.$.autoreconnect.setState(this.setup.autoreconnect);
		this.$.onconnect.setValue(this.setup.onconnect);
	},
	
	tabToggle: function(inSender, inValue) {
		var controls = this.$.tabs.getControls();
		for (var c = 0; c < controls.length; c++) {
			this.$[controls[c].value + 'Tab'].hide();
		}
		this.$[this.$.tabs.getValue() + 'Tab'].show();
	},
	
	requiredTest: function(inSender, inEvent, inValue) {
		// change disabled state of save button after checking required fields
		if (this.$.address.getValue() == '' ||
			this.$.nick1.getValue() == '') {
			this.$.saveButton.setDisabled(true);
		}
		else {
			this.$.saveButton.setDisabled(false);
		}
	},
	
	cancelButton: function() {
		this.owner.destroySecondary(true);
	},
	saveButton: function() {
		this.setup.alias = this.$.alias.getValue();
		this.setup.address = this.$.address.getValue();
		this.setup.nicks = [this.$.nick1.getValue(), this.$.nick2.getValue(), this.$.nick3.getValue()];
		this.setup.port = this.$.port.getValue();
		this.setup.user = this.$.user.getValue();
		this.setup.password = this.$.password.getValue();
		this.setup.realname = this.$.realname.getValue();
		this.setup.ssl = this.$.ssl.getState();
		this.setup.autoconnect = this.$.autoconnect.getState();
		this.setup.autoreconnect = this.$.autoreconnect.getState();
		this.setup.onconnect = this.$.onconnect.getValue();
		
		if (this.setup.id === false) {
			var saved = enyo.application.s.add(this.setup);
		}
		else {
			var saved = enyo.application.s.edit(this.setup);
		}
		
		if (saved) {
			this.owner.destroySecondary(true);
		}
		else {
			this.log('Not Saved!?');
		}
	},
	
});
