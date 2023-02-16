export interface ApiResDirectiveRoot {
    directive: ApiResDirective;
}
export interface ApiResDirective {
    payload: PurplePayload;
    header: DirectiveHeader;
}
export interface DirectiveHeader {
    name: string;
    refMessageId: string;
    messageId: string;
    namespace: Namespace;
    streamId: number;
}
export declare enum Namespace {
    Vins = "Vins"
}
export interface PurplePayload {
    version: string;
    header: PayloadHeader;
    response: Response;
    voice_response: VoiceResponse;
    counteractivation_features: CounteractivationFeatures;
    from_cache: boolean;
    lazy_tts_streaming: boolean;
    enable_bargin: boolean;
    disableInterruptionSpotter: boolean;
    format: string;
}
export interface CounteractivationFeatures {
    has_directive: boolean;
}
export interface PayloadHeader {
    response_id: string;
    request_id: string;
    ref_message_id: string;
    session_id: string;
    dialog_id: null;
}
export interface Response {
    cards: Card[];
    card: Card;
    quality_storage: QualityStorage;
    suggest: Suggest;
    experiments: Experiments;
    directives_execution_policy: string;
    directives: any[];
}
export interface Card {
    type: string;
    text: string;
}
export interface Experiments {
}
export interface QualityStorage {
    post_win_reason: string;
    scenarios_information: {
        [key: string]: ScenariosInformation;
    };
    pre_predicts: PrePredicts;
    post_predicts: PostPredicts;
}
export interface PostPredicts {
    GeneralConversation: number;
    Video: number;
    Vins: number;
    SideSpeech: number;
    Search: number;
    HollywoodMusic: number;
}
export interface PrePredicts {
    Alarm: number;
    SideSpeech: number;
    SkillDiscoveryGc: number;
    HardcodedResponse: number;
    Video: number;
    HollywoodMusic: number;
    Vins: number;
    GeneralConversation: number;
    Search: number;
}
export interface ScenariosInformation {
    reason: string;
    classification_stage: ClassificationStage;
}
export declare enum ClassificationStage {
    EcsPost = "ECS_POST",
    EcsPre = "ECS_PRE"
}
export interface Suggest {
    items: Item[];
}
export interface Item {
    type: ItemType;
    title: string;
    directives: ItemDirective[];
}
export interface ItemDirective {
    name: Name;
    payload: FluffyPayload;
    type: DirectiveType;
    sub_name?: SubName;
    ignore_answer?: boolean;
    is_led_silent?: boolean;
}
export declare enum Name {
    OnSuggest = "on_suggest",
    Type = "type"
}
export interface FluffyPayload {
    text?: string;
    button_id?: string;
    caption?: string;
    request_id?: string;
    scenario_name?: ScenarioName;
    "@scenario_name"?: Namespace;
}
export declare enum ScenarioName {
    GeneralConversation = "GeneralConversation"
}
export declare enum SubName {
    GcSuggest = "gc_suggest"
}
export declare enum DirectiveType {
    ClientAction = "client_action",
    ServerAction = "server_action"
}
export declare enum ItemType {
    Action = "action"
}
export interface VoiceResponse {
    directives: VoiceResponseDirective[];
    should_listen: boolean;
    output_speech: Card;
}
export interface VoiceResponseDirective {
    name: string;
    payload: TentacledPayload;
    type: string;
}
export interface TentacledPayload {
    user_objects?: string;
    method?: string;
    key?: string;
    value?: string;
    listening_is_possible?: boolean;
}
export interface StreamcontrolRoot {
    streamcontrol: Streamcontrol;
}
export interface Streamcontrol {
    messageId: string;
    reason: number;
    action: number;
    streamId: number;
}
//# sourceMappingURL=api.d.ts.map