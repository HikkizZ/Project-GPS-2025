import { SuperTest, Test } from 'supertest';

declare module 'supertest' {
    interface Test {
        send(data: any): this;
        set(field: string, value: string): this;
    }
} 