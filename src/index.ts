const default_levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
} as const;

export type KLoggerLevel = keyof typeof default_levels;

const default_console_colors = {
    error: "\x1b[31m", // red
    warn: "\x1b[33m", // yellow
    info: "\x1b[36m", // cyan
    http: "\x1b[35m", // magenta
    verbose: "\x1b[37m", // white
    debug: "\x1b[90m", // gray
    silly: "\x1b[95m", // bright magenta
};

const RESET = "\x1b[0m";

export class KLogger {
    private level: KLoggerLevel;
    private service_name: string;

    constructor({
        level = "info",
        service_name = "UNKNOWN-SERVICE",
    }: Partial<{
        level: KLoggerLevel;
        service_name: string;
    }> = {}) {
        this.level = level;
        this.service_name = service_name;

        for (const level in default_levels) {
            if (
                default_levels[level as keyof typeof default_levels] <=
                default_levels[this.level as keyof typeof default_levels]
            ) {
                (this as any)[level] = (message: any) => {
                    const prefix =
                        this.service_name.toUpperCase() +
                        ` ${new Date().toISOString()}`;

                    console.log(
                        `${
                            default_console_colors[
                                level as keyof typeof default_console_colors
                            ]
                        }[${prefix}]${RESET} ${message}`
                    );
                };
            }
        }
    }

    public child_logger({
        name,
        level = this.level,
    }: {
        name: string;
        level?: KLoggerLevel;
    }): KLogger {
        return new KLogger({
            level: level,
            service_name:
                this.service_name
                    .split("->")
                    .slice(-2)
                    .toSpliced(
                        -1,
                        1,
                        this.service_name
                            .split("->")
                            .at(-1)
                            ?.split("-")
                            .map((word) => word.slice(0, 3))
                            .join("-") ?? ""
                    )
                    .slice(-2)
                    .join("->") +
                "->" +
                name.toUpperCase(),
        });
    }

    public info(_: any) {}
    public error(_: any) {}
    public warn(_: any) {}
    public verbose(_: any) {}
    public debug(_: any) {}
    public silly(_: any) {}
    public http(_: any) {}
}
