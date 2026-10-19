import { Express } from 'express';
import { DatabaseExecutor } from '@momera/database';
export interface AppDependencies {
    db?: DatabaseExecutor;
}
export declare function createApp(deps?: AppDependencies): {
    app: Express;
    db: DatabaseExecutor;
};
//# sourceMappingURL=app.d.ts.map