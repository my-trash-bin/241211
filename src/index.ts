export type ParseJson<S extends string> = string extends S
  ? object
  : ExpectValue<S> extends [infer A, infer B extends string]
  ? TrimStart<B> extends ""
    ? A
    : never
  : never;

type TrimStart<S extends string> = S extends ` ${infer I}`
  ? TrimStart<I>
  : S extends `\t${infer I}`
  ? TrimStart<I>
  : S extends `\n${infer I}`
  ? TrimStart<I>
  : S;

type ExpectValue<S extends string> = TrimStart<S> extends `"${string}`
  ? ExpectString<S>
  : TrimStart<S> extends `{${string}`
  ? ExpectObject<S>
  : TrimStart<S> extends `[${string}`
  ? ExpectArray<S>
  : TrimStart<S> extends `true${infer I}`
  ? [true, I]
  : TrimStart<S> extends `false${infer I}`
  ? [false, I]
  : TrimStart<S> extends `null${infer I}`
  ? [null, I]
  : never;

type ExpectString<S extends string> = TrimStart<S> extends `"${infer I}`
  ? ExpectStringInternal<I>
  : never;

type ExpectStringInternal<
  S extends string,
  R extends string = ""
> = S extends `${infer A}"${infer B}`
  ? A extends `${string}\\`
    ? ExpectStringInternal<B, `${R}${A}\\"`>
    : A extends `${string}\n${string}`
    ? never
    : [Unescape<`${R}${A}`>, B]
  : never;

type Unescape<S extends string> = UnescapeInternal<S, "">;

type UnescapeInternal<
  S extends string,
  R extends string
> = S extends `${infer A}\\${infer B}`
  ? B extends `\\${infer C}`
    ? UnescapeInternal<C, `${R}${A}\\`>
    : B extends `"${infer C}`
    ? UnescapeInternal<C, `${R}${A}"`>
    : B extends `/${infer C}`
    ? UnescapeInternal<C, `${R}${A}/`>
    : B extends `b${infer C}`
    ? UnescapeInternal<C, `${R}${A}\b`>
    : B extends `t${infer C}`
    ? UnescapeInternal<C, `${R}${A}\t`>
    : B extends `n${infer C}`
    ? UnescapeInternal<C, `${R}${A}\n`>
    : B extends `f${infer C}`
    ? UnescapeInternal<C, `${R}${A}\f`>
    : B extends `r${infer C}`
    ? UnescapeInternal<C, `${R}${A}\r`>
    : never
  : `${R}${S}`;

type ExpectObject<S extends string> = TrimStart<S> extends `{${infer I}`
  ? ExpectObjectInternal<I, {}>
  : never;

type ExpectObjectInternal<
  S extends string,
  T
> = TrimStart<S> extends `}${infer I}`
  ? [T, I]
  : ExpectString<TrimStart<S>> extends [
      infer K$1 extends string,
      infer R$1 extends string
    ]
  ? TrimStart<R$1> extends `:${infer I}`
    ? ExpectValue<I> extends [infer V, infer R$2 extends string]
      ? TrimStart<R$2> extends `}${infer R$3}`
        ? [
            NeverIfOneIsNever<{
              [K$2 in K$1 | keyof T]: K$2 extends keyof T
                ? K$2 extends K$1
                  ? never
                  : T[K$2]
                : V;
            }>,
            R$3
          ]
        : TrimStart<R$2> extends `,${infer R$3}`
        ? ExpectObjectInternal<
            R$3,
            NeverIfOneIsNever<{
              [K$2 in K$1 | keyof T]: K$2 extends keyof T
                ? K$2 extends K$1
                  ? never
                  : T[K$2]
                : V;
            }>
          >
        : never
      : never
    : never
  : never;

type NeverIfOneIsNever<T> = [
  {
    [K in keyof T]: [T[K]] extends [never] ? true : never;
  }[keyof T]
] extends [never]
  ? T
  : never;

type ExpectArray<S extends string> = TrimStart<S> extends `[${infer I}`
  ? ExpectArrayInternal<I, []>
  : never;

type ExpectArrayInternal<
  S extends string,
  T extends any[] = []
> = TrimStart<S> extends `]${infer I}`
  ? [T, I]
  : ExpectValue<S> extends [infer V, infer R extends string]
  ? TrimStart<R> extends `]${infer I}`
    ? [[...T, V], I]
    : TrimStart<R> extends `,${infer I}`
    ? ExpectArrayInternal<I, [...T, V]>
    : never
  : never;
