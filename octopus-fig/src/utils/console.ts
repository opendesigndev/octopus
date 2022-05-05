import chalk from 'chalk'

export function displayPerf(time: number): string {
  const color = time > 50 ? chalk.red : chalk.yellow
  return '(' + color(`${time.toFixed(2)}ms`) + ')'
}
