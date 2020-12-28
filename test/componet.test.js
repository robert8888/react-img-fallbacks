import React from 'react';

import {shallow, mount} from "enzyme"
import {delay, getLocalFileUrl, spyConsole} from "./utils";

import ImageFallback from './../src/ImageFallback';

const urls = {
    working: [`https://i.imgur.com/vk3c3I3.jpg`, `https://i.imgur.com/4pjZbyA.png`, `https://i.imgur.com/o9Jpio7.jpg`],
    fake: [`https://imgur.com/rasdfzsdf.jsdf`, `https://fake.domain/image/url/photo.png`],
    local: {
        working:  getLocalFileUrl("./assets/test.img.png"),
        fake: getLocalFileUrl("./assets/not.exist.png")
    }
}


describe('Render Component <ImageFallback />', () => {
    let spy = spyConsole();

    test('Basic component render', () => {
        const wrapper = shallow(<ImageFallback />);
        expect(wrapper.find("img")).toHaveLength(1);
    });

    test('Check PropTypes missing src prop ', () => {
        const wrapper = mount(<ImageFallback />);
        expect(wrapper.prop('src')).toEqual(undefined);
        expect(console.error).toHaveBeenCalled();
        expect(spy.console.mock.calls[0][2]).toContain('The prop `src` is marked as required');
    });

    test('Check onError callback call without src and initSrc prop', () => {
        const onErrorMock = jest.fn()
        mount(<ImageFallback onError={onErrorMock} />);
        expect(onErrorMock).toBeCalled()
    });

    test('Check onError call with fake initSrc prop', async () => {
        const onErrorMock = jest.fn()
        const wrapper = mount(<ImageFallback onError={onErrorMock} initSrc={urls.fake[1]}/>);
        await delay(500);
        wrapper.update();

        expect(wrapper.find("img").prop("src")).toEqual(urls.fake[1])
        expect(onErrorMock).toBeCalled()
        expect(onErrorMock).toBeCalledWith(
            expect.objectContaining({
                url: urls.fake[1],
                error: expect.any(Error),
                event: expect.objectContaining({"_reactName": expect.stringContaining("onError")})
            })
        )
    });

    test('Check onError call with fake src prop and without initSrc', async () => {
        const onErrorMock = jest.fn()
        const wrapper = mount(<ImageFallback onError={onErrorMock} src={urls.fake[0]}/>);

        await delay(500);
        wrapper.update();

        expect(wrapper.find("img").prop("src")).toEqual(urls.fake[0])
        expect(onErrorMock).toBeCalledTimes(1)
        expect(onErrorMock).toBeCalledWith(
            expect.objectContaining({
                url: urls.fake[0],
                error: expect.any(Error),
                event: expect.objectContaining({"isTrusted":  true})
            })
        )
    });

    test('Check onLoad with correct src', async () => {
        const onErrorMock = jest.fn();
        const onLoadMock = jest.fn();
        const wrapper = mount(
            <ImageFallback onError={onErrorMock} onLoad={onLoadMock} src={urls.working[0]}/>
        );
        await delay(500);
        wrapper.update();

        expect(wrapper.find("img").prop("src")).toEqual(urls.working[0])
        expect(onErrorMock).not.toBeCalled();
        expect(onLoadMock).toBeCalled();
    });

    test('Check fallback initSrc with one fail src', async () => {
        const onErrorMock = jest.fn();
        const onLoadMock = jest.fn();
        const wrapper = mount(
            <ImageFallback onError={onErrorMock} onLoad={onLoadMock}
                           src={urls.fake[0]} initSrc={urls.working[1]}/>
        );
        await delay(500);
        wrapper.update();

        expect(wrapper.find("img").prop("src")).toEqual(urls.working[1])

        expect(onLoadMock).toHaveBeenCalledTimes(1)
        expect(onLoadMock).toBeCalledWith(expect.objectContaining({
            url: urls.working[1],
            isInit: true,
            isFallback: true,
        }));

        expect(onErrorMock).toHaveBeenCalledTimes(1)
        expect(onErrorMock).toBeCalledWith(expect.objectContaining({
            url: urls.fake[0],
            event: expect.any(Event),
            error: expect.any(Error)
        }))
    });


    test('Check fallback with one 2 fail and one third working src and initSrc', async () => {
        const onErrorMock = jest.fn();
        const onLoadMock = jest.fn();
        const wrapper = mount(
            <ImageFallback onError={onErrorMock} onLoad={onLoadMock}
                           src={[urls.fake[0], urls.fake[1], urls.working[0]]}
                           initSrc={urls.working[1]}/>
        );
        await delay(500);
        wrapper.update();

        expect(wrapper.find("img").prop("src")).toEqual(urls.working[0])

        expect(onLoadMock).toHaveBeenCalledTimes(2);
        expect(onLoadMock).toHaveBeenNthCalledWith(1, expect.objectContaining({
            url: urls.working[1],
            isInit: true,
            isFallback: true
        })) // initSrc
        expect(onLoadMock).toHaveBeenNthCalledWith(2, expect.objectContaining({
            url: urls.working[0],
            isInit: false,
            isFallback: 2
        })) // last src

        expect(onErrorMock).toHaveBeenCalledTimes(2)
        expect(onErrorMock).toHaveBeenNthCalledWith(1, expect.objectContaining({
            url: urls.fake[0],
            error: expect.any(Error),
            event: expect.any(Event)
        }));
        expect(onErrorMock).toHaveBeenNthCalledWith(2, expect.objectContaining({
            url: urls.fake[1],
            error: expect.any(Error),
            event: expect.any(Event)
        }));
    });

    test('Check reload image on src change', async () => {
        const onLoadMock = jest.fn();
        const wrapper = mount(
            <ImageFallback onLoad={onLoadMock} src={urls.working[0]}/>
        );

        expect(wrapper.find("img").prop("src")).toEqual(urls.working[0])

        wrapper.setProps({ src: urls.working[1] })

        await delay(2000);
        wrapper.update();

        expect(await wrapper.find("img").html()).toContain(urls.working[1])

        wrapper.update();

        expect(onLoadMock).toHaveBeenCalledTimes(2);
        expect(onLoadMock).toHaveBeenNthCalledWith(1, expect.objectContaining({
            url: urls.working[0],
            isInit: false,
            isFallback: 0
        }))
        expect(onLoadMock).toHaveBeenNthCalledWith(2, expect.objectContaining({
            url: urls.working[1],
            isInit: false,
            isFallback: 0
        }))
    })

    test('Check fallback appear after timeout time', async () => {
        const onErrorMock = jest.fn();
        const onLoadMock = jest.fn();
        const wrapper = mount(
            <ImageFallback onError={onErrorMock} onLoad={onLoadMock} src={urls.fake[0]}
                           timeout={200} initSrc={urls.working[1]}/>
        );

        expect(wrapper.find("img").prop("src")).toEqual("")

        await delay(250)
        wrapper.update();

        expect(wrapper.find("img").prop("src")).toEqual(urls.working[1])

        expect(onErrorMock).toBeCalledTimes(1);
        expect(onErrorMock).toBeCalledWith(expect.objectContaining({
            url: urls.fake[0],
            error: expect.any(Error),
            event: expect.any(Event)
        }))
    });

    test('Check fallback appear after timeout time', async () => {
        const onErrorMock = jest.fn();
        const onLoadMock = jest.fn();
        const wrapper = mount(
            <ImageFallback onError={onErrorMock} onLoad={onLoadMock} src={urls.working[1]}
                           timeout={200} initSrc={urls.working[2]}/>
        );

        expect(wrapper.find("img").prop("src")).toEqual("")

        await delay(550)
        wrapper.update();

        expect(wrapper.find("img").prop("src")).toEqual(urls.working[1])

        expect(onErrorMock).not.toBeCalled();
        expect(onLoadMock).toBeCalledTimes(1);
        expect(onLoadMock).toBeCalledWith(expect.objectContaining({
            url: urls.working[1],
            isInit: false,
            isFallback: 0,
        }))
    })


    test('Check fallback without initSrc and two src, second correct', async () => {
        const onErrorMock = jest.fn();
        const onLoadMock = jest.fn();
        const wrapper = mount(
            <ImageFallback onError={onErrorMock} onLoad={onLoadMock}
                           src={[urls.fake[0], urls.working[1]]}/>
        );
        await delay(400);
        wrapper.update();

        expect(onErrorMock).toBeCalledTimes(1);
        expect(onLoadMock).toBeCalledTimes(1);
        expect(await wrapper.find("img").html()).toContain(urls.working[1])
    })

    test('Check build html attributes and events', async () => {
        const onClickCallback = jest.fn();
        const wrapper = mount(
            <ImageFallback onClick={onClickCallback} alt={"Image describe"} width={"300px"}/>
        );
        await delay(400);
        wrapper.update();

        const img = wrapper.find("img");
        expect(img.prop("src")).toEqual("")
        expect(img.prop("alt")).toEqual("Image describe");
        expect(img.prop("width")).toEqual("300px");

        img.simulate("click", {clientX: 50, clientY: 50});
        expect(onClickCallback).toBeCalledTimes(1);
        expect(onClickCallback).toBeCalledWith(expect.objectContaining({
            clientX: 50,
            clientY: 50
        }))
    })

    test('Check local images source', async () => {
        const onErrorCallback = jest.fn();
        const wrapper = mount(
            <ImageFallback onError={onErrorCallback} src={urls.local.working}/>
        );

        await delay(100);
        expect(onErrorCallback).not.toBeCalled();

        wrapper.setProps({"src": urls.local.fake});
        await delay(100);
        wrapper.update();

        expect(onErrorCallback).toBeCalledTimes(1);
        expect(onErrorCallback).toBeCalledWith(expect.objectContaining({
            url: urls.local.fake,
            error: expect.any(Error),
            event: expect.any(Event)
        }))
    })

    test("Check local image fallback with external fail", async () => {
        const onErrorCallback = jest.fn();
        const onLoadCallback = jest.fn();
        const wrapper = mount(
            <ImageFallback onError={onErrorCallback}
                           onLoad={onLoadCallback}
                           src={[urls.fake[0], urls.working[0]]}
                           initSrc={urls.local.working}/>
        );

        await delay(500);
        wrapper.update();

        expect(await wrapper.find("img").html()).toContain(urls.working[0])
        expect(onErrorCallback).toBeCalledWith(expect.objectContaining({
            url: urls.fake[0],
            error: expect.any(Error),
            event: expect.any(Event)
        }))

        expect(onLoadCallback).toHaveBeenNthCalledWith(1, expect.objectContaining({
            url: urls.local.working,
            isInit: true,
            isFallback: true
        }))
        expect(onLoadCallback).toHaveBeenNthCalledWith(2, expect.objectContaining({
            url: urls.working[0],
            isInit: false,
            isFallback: 1
        }))
    })
});