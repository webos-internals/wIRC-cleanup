function DccDashboardAssistant(params)
{
	this.id			=	params.id;
	this.server 	=	servers.servers[params.id];
	this.nick 		=	params.nick;
	this.address	=	params.address;
	this.filename	=	params.filename;
	this.size		=	params.size;
	this.dcc_id 	=	params.dcc_id;
	
	this.dashboardElement =			false;
	this.newNumberBubbleElement =	false;
	this.newNumberElement =			false;
	this.dashboardTitleElement =	false;
	this.dashboardTextElement =		false;
	this.iconActionElement =		false;
	this.textActionElement =		false;
	
	this.messageCount =				0;
}

DccDashboardAssistant.prototype.setup = function()
{
	this.dashboardElement =			this.controller.get('dashboard');
	this.newNumberBubbleElement =	this.controller.get('newNumberBubble');
	this.newNumberElement =			this.controller.get('newNumber');
	this.dashboardTitleElement =	this.controller.get('dashboardTitle');
	this.dashboardTextElement =		this.controller.get('dashboardText');
	this.iconActionElement =		this.controller.get('iconAction');
	this.textActionElement =		this.controller.get('textAction');
	
	this.dashTapHandler =	this.dashTapped.bindAsEventListener(this);
	
	// hide new bubble
	this.newNumberBubbleElement.style.display = 'none';
	
	// puts message
	if (this.filename && this.size) {
		this.dashboardTitleElement.innerHTML = 'DCC SEND: ' + this.nick;
		this.dashboardElement.className = 'dcc-send-dashboard dashboard-notification-module';
	}
	else {
		this.dashboardTitleElement.innerHTML = 'DCC CHAT: ' + this.nick;
		this.dashboardElement.className = 'dcc-chat-dashboard dashboard-notification-module';
	}
	this.dashboardTextElement.innerHTML = 'Tap to Accept, Swipe to Reject.';
	
	// to whole thing for tap
	Mojo.Event.listen(this.dashboardElement, Mojo.Event.tap, this.dashTapHandler);
}

DccDashboardAssistant.prototype.dashTapped = function(event)
{
	alert('DCC DASHBOARD TAP: ' + this.id + ' ' + this.dcc_id);
	plugin.dcc_accept(this.id, this.dcc_id);
	this.server.closeDCCRequest(this.dcc_id);
}

DccDashboardAssistant.prototype.cleanup = function(event)
{
	this.server.closeDCCRequest(this.dcc_id);
	Mojo.Event.stopListening(this.dashboardElement, Mojo.Event.tap, this.dashTapHandler);
}