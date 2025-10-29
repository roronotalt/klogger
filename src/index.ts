const default_levels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    http: 4,
    verbose: 5,
    debug: 6,
    silly: 7,
} as const;

export type KLoggerLevel = keyof typeof default_levels;

const default_console_colors = {
    fatal: "\x1b[31m", // red
    error: "\x1b[91m", // light red
    warn: "\x1b[33m", // yellow
    info: "\x1b[36m", // cyan
    http: "\x1b[92m", // light green
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
                (this as any)[level] = (...args: any[]) => {
                    const prefix = `${
                        default_console_colors[
                            level as keyof typeof default_console_colors
                        ]
                    }[${this.service_name.toUpperCase()}]${RESET} ${new Date().toISOString()}]`;

                    args.forEach((message, index) => {
                        typeof message === "object"
                            ? (index === 0 ? console.log(prefix) : null,
                              console.dir(message, { depth: 6 }))
                            : console.log(`${prefix} ${message}`);
                    });
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

    public fatal(..._args: any[]): void {}
    public error(..._args: any[]): void {}
    public info(..._args: any[]): void {}
    public warn(..._args: any[]): void {}
    public verbose(..._args: any[]): void {}
    public debug(..._args: any[]): void {}
    public silly(..._args: any[]): void {}
    public http(..._args: any[]): void {}
}
