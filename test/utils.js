import path from "path";

export function spyConsole() {
    let spy = {};

    beforeAll(() => {
        spy.console = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        spy.console.mockRestore();
    });

    return spy;
}

export const delay = (time) => new Promise((res, rej) => setTimeout(() => res(), time))

export const getLocalFileUrl = url => "file:///" + path.resolve(__dirname, url)