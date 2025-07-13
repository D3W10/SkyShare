import log from "electron-log/main";

log.transports.file.fileName = "logs.log";
log.transports.file.getFile().clear();
log.transports.console.format = "{h}:{i}:{s}.{ms}{scope} › {text}";
log.transports.console.useStyles = true;
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} › {text}";

export class Logger {
    private readonly name: string;
    private readonly color: string;
    private readonly logger;

    constructor(name: string, color: string) {
        this.name = name.toUpperCase();
        this.color = color;
        this.logger = log.scope(`%c${this.name}%c`);
    }

    info(data: any) {
        this.log(data);
    }

    log(data: any, ...colors: string[]) {
        this.logger.info(`color: ${this.color}`, "color: unset", data, ...(colors.map((e) => `color: ${e}`)));
    }

    warn(data: any, ...colors: string[]) {
        this.logger.warn(`color: ${this.color}`, "color: unset", `%c${data}`, "color: yellow", ...(colors.map((e) => `color: ${e}`)));
    }

    error(data: any, ...colors: string[]) {
        this.logger.error(`color: ${this.color}`, "color: unset", `%c${data}`, "color: red", ...(colors.map((e) => `color: ${e}`)));
    }
}