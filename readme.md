### Installation
```javascript
npm install react-img-fallback
```

### PropTypes
```javascript
const propTypes = {
    src: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.string
    ]).isRequired,
    initSrc: PropTypes.string,
    timeout: PropTypes.number,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
    rest: PropTypes.any, // all std img properties 
}
```

### Usage 
```javascript
import Img from "react-img-fallback"

const Component = () => {
    const onLoad = ({url, isInit, isFallback}) => {
        console.log(`image with ${url} was loaded`)
    }
    
    const onError = ({url, event, error}) => {
        console.log(error.message) 
        //Image fallback from src collection with 'path/to/fail' can't be loaded
    }
    
    return (
        <div>
/* 1 */     <Img src="path/to/img.png" alt="description" className={".img-fallback"}/> 
            // you can use all std img properties
/* 2 */     <Img src={["path/to/fail.png", "path/to/work.png"]} /> 
            // first of working path will be displayed 
/* 3 */     <Img src={["path/to/fail.png"]} 
                 initSrc={"initial/img/path"}/> 
                 // with inital img immediately loaded 
/* 4 */     <Img src="path/to/fail.png" 
                 initSrc={"initial/img/path"} 
                 timout={300}/> 
                 // with timout of inital loading intSrc if any of srs's 
                 // will not be loaded within 300 ms
/* 5 */     <Img src="path/to/fail.png" 
                 initSrc={"initial/img/path"} 
                 onError={onError}/> 
                 // with onError witch will be calle on each failed url
/* 6 */     <Img src={["bac/path/img.jpg", "path/to/good.png"]}
                 initSrc={"initial/img/path"}
                 onLoad={onLoad}/>
                 // on load is called with iniSrc and first 
                 // succes loaded img from src's          
        </div>
    )
}
```
### Use case
1. Img component have all standard html image component attributes
2. When you put ulr to images in src array, then first loaded successful loaded image will be
displayed. onError will be called with all failed urls and onLoad will be called with
first successful url.
3. initSrc will be displayed until any of url from src array will be loaded. You can use it 
to display smaller version of image before large one will be loaded. But if first of successful 
loaded image will be download fast then can may be a fast blink image effect. 
4. Common with initSrc you can use timeout. If after time specified by timeout any of src's
will not be loaded then initSrc will be displayed. onLoad will be called with isInt = true. 
This allows to prevent blinking an intiSrc image before will be loaded desired one
5. onError(obj) - is called on each failed try with object argument containing:
    * obj.url - of failed loaded resources
    * obj.event - from onerror callback
    * obj.error - error object with a message described reason
6. onLoad(obj) - is called on each successful loaded resources with object argument containing:
    * obj.url - of loaded resources 
    * obj.isInit - is this resources initSrc url 
    * obj.isFallback - true if is isInit or index of loaded src's array. 
    if loaded is first of url from array then this came becomes 0, otherwise is trueable

### Built 
- React 17
- Webpack 5

### Testing
- Jest + Enzyme