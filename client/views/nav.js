Template.nav.events({
    'click toolbar-edit-stability': function (){
        _.each(tools, function (tool){
            Session.set(tool, false);
        });
        Session.set("toolbar_edit_stability", true);
    },
    'click toolbar-edit-diameter': function (){
        _.each(tools, function (tool){
            Session.set(tool, false);
        });
        Session.set("toolbar_edit_diameter", true);
    },
    'click toolbar-edit-speed': function (){
        _.each(tools, function (tool){
            Session.set(tool, false);
        });
        Session.set("toolbar_edit_speed", true);
    },
})