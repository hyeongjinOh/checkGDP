/*
declare module "*.module.css" {
    const content: { [className: string]: string };
    export = content;
}
declare module '*.module.css' {
    const value: Record<string, string>;
    export default value;
}
declare module "*.css" {
    const classes: { [key: string]: string };
    export default classes;
}

*/
declare module "*.module.css" {
    const classes: { [key: string]: string };
    export default classes;
}




