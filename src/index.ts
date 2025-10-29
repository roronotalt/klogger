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

const safe_stringify = (obj: any, max_depth: number = 6): string => {
    const seen = new WeakSet();

    const helper = (value: any, depth: number): any => {
        if (depth > max_depth) return "[MaxDepth]";
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) return "[Circular]";
            seen.add(value);
            if (Array.isArray(value))
                return value.map((v) => helper(v, depth + 1));
            const out: Record<string, any> = {};
            for (const [k, v] of Object.entries(value))
                out[k] = helper(v, depth + 1);
            return out;
        }
        return value;
    };

    return JSON.stringify(helper(obj, 0));
};

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
                (this as any)[level] = (
                    message: any,
                    sanitize: boolean = true
                ) => {
                    const prefix =
                        this.service_name.toUpperCase() +
                        ` ${new Date().toISOString()}`;

                    console.log(
                        `${
                            default_console_colors[
                                level as keyof typeof default_console_colors
                            ]
                        }[${prefix}]${RESET} ${
                            sanitize ? safe_stringify(message) : message
                        }`
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

    public info(_message: any, _sanitize?: boolean): void {}
    public error(_message: any, _sanitize?: boolean): void {}
    public warn(_message: any, _sanitize?: boolean): void {}
    public verbose(_message: any, _sanitize?: boolean): void {}
    public debug(_message: any, _sanitize?: boolean): void {}
    public silly(_message: any, _sanitize?: boolean): void {}
    public http(_message: any, _sanitize?: boolean): void {}
}
