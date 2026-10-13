/** Mutex sederhana berbasis Promise untuk mengantri penulisan file JSON. */
export class Mutex {
  private chain: Promise<unknown> = Promise.resolve();

  run<T>(job: () => Promise<T>): Promise<T> {
    const next = this.chain.then(job, job);
    this.chain = next.catch(() => {});
    return next;
  }
}
