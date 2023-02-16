"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemType = exports.DirectiveType = exports.SubName = exports.ScenarioName = exports.Name = exports.ClassificationStage = exports.Namespace = void 0;
var Namespace;
(function (Namespace) {
    Namespace["Vins"] = "Vins";
})(Namespace = exports.Namespace || (exports.Namespace = {}));
var ClassificationStage;
(function (ClassificationStage) {
    ClassificationStage["EcsPost"] = "ECS_POST";
    ClassificationStage["EcsPre"] = "ECS_PRE";
})(ClassificationStage = exports.ClassificationStage || (exports.ClassificationStage = {}));
var Name;
(function (Name) {
    Name["OnSuggest"] = "on_suggest";
    Name["Type"] = "type";
})(Name = exports.Name || (exports.Name = {}));
var ScenarioName;
(function (ScenarioName) {
    ScenarioName["GeneralConversation"] = "GeneralConversation";
})(ScenarioName = exports.ScenarioName || (exports.ScenarioName = {}));
var SubName;
(function (SubName) {
    SubName["GcSuggest"] = "gc_suggest";
})(SubName = exports.SubName || (exports.SubName = {}));
var DirectiveType;
(function (DirectiveType) {
    DirectiveType["ClientAction"] = "client_action";
    DirectiveType["ServerAction"] = "server_action";
})(DirectiveType = exports.DirectiveType || (exports.DirectiveType = {}));
var ItemType;
(function (ItemType) {
    ItemType["Action"] = "action";
})(ItemType = exports.ItemType || (exports.ItemType = {}));
//# sourceMappingURL=api.js.map