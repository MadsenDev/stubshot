type LoggerOpts = { silent: boolean; verbose: boolean };

export function createLogger(opts: LoggerOpts) {
  return {
    info(message: string) {
      if (!opts.silent) console.log(message);
    },
    debug(message: string) {
      if (!opts.silent && opts.verbose) console.log(message);
    },
  };
}

