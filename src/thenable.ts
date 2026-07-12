export interface Thenable<T> {
  then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (reason: any) => U | Thenable<U>): Thenable<U>
  then<U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (reason: any) => void): Thenable<U>
}
