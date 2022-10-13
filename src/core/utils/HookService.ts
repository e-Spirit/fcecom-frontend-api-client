/**
 * this Service Class holds the Hook registry and handles the execution of The Hooks.
 */
export class HookService {
    private static instance: HookService;
    private hooks: HookMap = {};

    private constructor() {}

    /**
     * Static Method to get an Instance of the Service, this is needed to ensure this Service is a Singleton.
     */
    public static getInstance(): HookService {
        if (!HookService.instance) {
            HookService.instance = new HookService();
        }

        return HookService.instance;
    }

    /**
     * This Method registers a new Hook to the registry.
     * @param name The Namespace for which the Hook is to be added {@link AvailableHooks}
     * @param scope The Scope of the Function to be executed (needed to set the This context)
     * @param func The Function to be Executed when the Hook is called.
     */
    public addHook(name: string, scope: any, func: (params:any) => void): void {
        if (!this.hooks[name]) {
            this.hooks[name] = [];
        }
        this.hooks[name].push({scope, func});
    }

    /**
     * This Method Calls a Hook and executes all Functions registered under the provided Namespace.
     * @param name The Namespace for which the Hook is to be added {@link AvailableHooks}
     * @param params the payload to be passed to the executed Methods
     */
    public callHook(name: string, ...params: any): void {
        if (this.hooks[name]) {
            this.hooks[name].forEach(tuple => tuple.func.call(tuple.scope, ...params));
        }
    }
}

interface ScopeFunctionTuple {
    scope: any;
    func: ((...params:any ) => void);
}

interface HookMap {
    [name: string]: ScopeFunctionTuple[];
}

export enum AvailableHooks {
    CREATED_PAGE = 'createdPage',
}

export default HookService.getInstance();