import test from 'ava'
import moonPages from '..'

// TODO: Implement module test
test('<test-title>', t => {
  const err = t.throws(() => moonPages(100), TypeError)
  t.is(err.message, 'Expected a string, got number')

  t.is(moonPages('w'), 'w@zce.me')
  t.is(moonPages('w', { host: 'wedn.net' }), 'w@wedn.net')
})
