import * as env from "./envUtils"


export default function clog(props) {
    return (
        env.isDevelopmentMode&&console.log(props)
    )
}