import chalk from 'chalk'

export function displayPerf(time: number, threshold = 50): string {
  const color = time > threshold ? chalk.red : chalk.yellow
  return '(' + color(`${time.toFixed(2)}ms`) + ')'
}
