const AC = require("accesscontrol");
const accessControl = new AC();

exports.roles = (function() {

    accessControl.grant("user")
                 .readOwn("profile")
                 .updateOwn("profile");

    accessControl.grant("admin")
                 .extend("user")
                 .updateAny("profile")
                 .deleteAny("profile");

    return accessControl;

})();