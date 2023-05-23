/**
 * Parses the input csv string
 * @param {string} csv
 * @param {object} options
 * @property {','|';'|'\t'} [options.separator=',']
 * @property {true|string[]} [options.header=true]
 * @property {'\''|'"'} [options.stringDelimiter='"']
 * @param {object} callbacks
 * @async
 */
export default async function parseCSV<R extends Record<any, any>[]> (
  csv: string,
  options?: {
    separator?: ',' | ';' | '\t',
    header?: true | string[],
    stringDelimiter?: '\''|'"'
  },
  callbacks?: Record<number, (str: string) => any>): Promise<R> {
  return new Promise<R>((resolve, reject) => {
    const opts = {
      separator: options?.separator ?? ',',
      header: options?.header ?? true,
      stringDelimiter: options?.stringDelimiter ?? '"'
    }

    const lines = csv.split(/\r?\n/g)
    const cells: string[][] = []

    for (let i = 0, line = lines[i]; i < lines.length; line = lines[++i]) {
      if (line === '') continue
      cells.push([''])
      const result = cells[i]
      let currentCell = 0,
        inString = false

      const incrementCell = () => {
        currentCell++
        result[currentCell] = ''
      }

      for (let c = 0, char = line[c]; c < line.length; char = line[++c]) {
        switch (char) {
          case opts.separator:
            if (inString) {
              result[currentCell] += char
            } else incrementCell()
            break
          case opts.stringDelimiter:
            if (inString && line[c + 1] === opts.stringDelimiter) {
              result[currentCell] += char
              c++
            } else inString = !inString
            break
          default:
            result[currentCell] += char
        }
      }
    }

    if (cells.some(line => line.length !== cells[0].length)) return reject(new SyntaxError('Malformed CSV'))

    const headers = opts.header === true ? cells[0] : opts.header
    if (opts.header === true) cells.shift()

    resolve(cells.map(line => Object.fromEntries(headers.map((key, idx) => [key, callbacks?.[idx] ? callbacks[idx](line[idx]): line[idx]]))) as R)
  })
}
