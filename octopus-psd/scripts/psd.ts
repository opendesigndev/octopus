import PSD from 'psd'

const [location] = process.argv.slice(2)
const psd = PSD.fromFile(location)
psd.parse()

console.log(JSON.stringify(psd.tree().export()))
console.log()
console.log('children', psd.tree().children())
console.log('descendants', psd.tree().descendants())
console.log('path', psd.tree().path())

// You can also use promises syntax for opening and parsing
PSD.open(location)
  .then(function (psd) {
    return psd.image.saveAsPng('./output.png')
  })
  .then(function () {
    console.log('Finished!')
  })
