import React, {useState, useEffect, useRef, useCallback} from "react";
import PropTypes from "prop-types";

const propTypes = {
    src: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.string
    ]).isRequired,
    initSrc: PropTypes.string,
    timeout: PropTypes.number,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
    rest: PropTypes.any,
}

const ImageFallback = ({onLoad, onError, src, initSrc, timeout = 0, ...rest}) => {
    const [source, setSource] = useState(timeout ? "" : (initSrc || (src instanceof Array && src[0]) || src || ""));
    const image = useRef();
    const isLoaded = useRef();
    const errors = useRef([]);

    const onLoadCallback = useRef(() => {});
    useEffect(() => { onLoadCallback.current = onLoad || (() => {}) }, [onLoad]);

    const onErrorCallback = useRef(() => {});
    useEffect(() => { onErrorCallback.current = onError || (() => {}) }, [onError]);

    const throwError = (event, url, error) =>{
        if(url === "" || errors.current.includes(url))
            return;
        onErrorCallback.current({event, url, error});
        errors.current.push(url)
    }

    useEffect(() => {
        timeout && setTimeout(() => {
            if(isLoaded.current)
                return
            setSource(initSrc)
            onLoadCallback.current({
                url: initSrc,
                isInit: true,
                isFallback: true
            });
            isLoaded.current = true;
        }, timeout)
    }, [timeout, isLoaded])

    const load = useCallback( url => new Promise((res, rej) => {
        image.current.onload = e => res(e);
        image.current.onerror = e => rej(e);
        image.current.src = url;
    }), [image])


    useEffect(() => {
        isLoaded.current = false;

        if((!src || !src?.length) && !initSrc){
            throwError(new Event("error"), null, new Error("Component expect at least one src element or initSrc"))
            return () => {};
        }

        const sources = src instanceof Array ? src : (src ? [src] : []);
        image.current = new Image();
        (async () => {
            for(let source of sources){
                try{
                    await load(source);
                    setSource(current => {
                        if(current !== source){
                            isLoaded.current = true;
                            onLoadCallback.current({
                                url: source,
                                isInit: source === initSrc,
                                isFallback: src.indexOf(source)
                            });
                        }
                        return source
                    });
                    break;
                } catch (error) {
                    throwError(
                        error,
                        source,
                        new Error(`Image fallback from src collection with '${source}' can't be loaded`)
                    )
                }
            }
        })()
    }, [image, src, initSrc, load, onErrorCallback, onLoadCallback])

    return (
        <img src={source}
             onError={e => throwError(e, source, new Error(`Image with '${source}' can't be loaded`))}
             onLoad={() => {
                 if(isLoaded.current) return;
                 onLoadCallback.current({
                     url: source,
                     isInit: source === initSrc,
                     isFallback: source === initSrc || (src instanceof Array && src.indexOf(source)) || 0
                 });
                 isLoaded.current = true;
             }}
             {...rest}/>
    )
}

ImageFallback.propTypes = propTypes;

export default ImageFallback;