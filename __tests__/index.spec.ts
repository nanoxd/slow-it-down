import after from 'after'
import express from 'express'
import supertest from 'supertest'

import slowDown from '../src'

const XFF_HEADER = 'x-forwarded-for'

describe('slowDown', () => {
  it('should rate limit ips', done => {
    done = after(2, done)

    const app = express()
    app.use(
      slowDown({
        burst: 1,
        rate: 1,
        ip: true,
      })
    )

    app.get('/', (req, res, next) => {
      res.send('hey')
    })

    app.use(errorHandler)

    supertest(app).get('/').expect(200).end((err, res) => {
      expect(res.text).toBe('hey')
      done(err)
    })

    supertest(app).get('/').expect(429).end((err, res) => {
      expect(res.text).toBe('You have exceeded your request rate of 1 r/s.')
      done(err)
    })
  })

  it('should rate limit on xff header', done => {
    done = after(3, done)

    const app = express()
    app.use(
      slowDown({
        burst: 1,
        rate: 1,
        xff: true,
      })
    )

    app.get('/', (req, res, next) => {
      res.send('hello')
    })

    app.use(errorHandler)

    supertest(app)
      .get('/')
      .set(XFF_HEADER, '10.1.1.1')
      .expect(200)
      .end((err, res) => {
        expect(res.text).toBe('hello')
        done(err)
      })

    supertest(app)
      .get('/')
      .set(XFF_HEADER, '10.1.1.2')
      .expect(200)
      .end((err, res) => {
        expect(res.text).toBe('hello')
        done(err)
      })

    supertest(app)
      .get('/')
      .set(XFF_HEADER, '10.1.1.1')
      .expect(429)
      .end((err, res) => {
        expect(res.text).toBe('You have exceeded your request rate of 1 r/s.')
        done(err)
      })
  })

  it('should allow IP overrides', done => {
    done = after(2, done)

    const app = express()
    app.use(
      slowDown({
        burst: 1,
        rate: 1,
        xff: true,
        overrides: {
          '10.1.1.1': {
            burst: 2,
            rate: 2,
          },
        },
      })
    )

    app.get('/', (req, res, next) => {
      res.send('hello')
    })

    supertest(app)
      .get('/')
      .set(XFF_HEADER, '10.1.1.1')
      .expect(200)
      .end((err, res) => {
        expect(res.text).toBe('hello')
        done(err)
      })

    supertest(app)
      .get('/')
      .set(XFF_HEADER, '10.1.1.1')
      .expect(200)
      .end((err, res) => {
        expect(res.text).toBe('hello')
        done(err)
      })
  })

  it('should allow netmask overrides', done => {
    done = after(2, done)

    const app = express()
    app.use(
      slowDown({
        burst: 1,
        rate: 1,
        xff: true,
        overrides: {
          '10.1.1.192/27': {
            burst: 2,
            rate: 2,
          },
        },
      })
    )

    app.get('/', (req, res, next) => {
      res.send('hello')
    })

    supertest(app)
      .get('/')
      .set(XFF_HEADER, '10.1.1.223')
      .expect(200)
      .end((err, res) => {
        expect(res.text).toBe('hello')
        done(err)
      })

    supertest(app)
      .get('/')
      .set(XFF_HEADER, '10.1.1.223')
      .expect(200)
      .end((err, res) => {
        expect(res.text).toBe('hello')
        done(err)
      })
  })

  it('should correctly identify IP when proxied', done => {
    done = after(2, done)

    const app = express()
    app.use(
      slowDown({
        burst: 1,
        rate: 1,
        xff: true,
        overrides: {
          '10.1.1.192/27': {
            burst: 2,
            rate: 2,
          },
        },
      })
    )

    app.get('/', (req, res, next) => {
      res.send('hello')
    })

    supertest(app)
      .get('/')
      .set(XFF_HEADER, '10.1.1.197, 2.2.2.2')
      .expect(200)
      .end((err, res) => {
        expect(res.text).toBe('hello')
        done(err)
      })

    supertest(app)
      .get('/')
      .set(XFF_HEADER, '10.1.1.197, 2.2.2.2')
      .expect(200)
      .end((err, res) => {
        expect(res.text).toBe('hello')
        done(err)
      })
  })

  it('should not rate limit IP outside of net mask', done => {
    done = after(2, done)

    const app = express()
    app.use(
      slowDown({
        burst: 1,
        rate: 1,
        xff: true,
        overrides: {
          '10.1.1.192/27': {
            burst: 2,
            rate: 2,
          },
        },
      })
    )

    app.get('/', (req, res, next) => {
      res.send('hello')
    })

    app.use(errorHandler)

    supertest(app)
      .get('/')
      .set(XFF_HEADER, '10.1.1.1')
      .expect(200)
      .end((err, res) => {
        expect(res.text).toBe('hello')
        done(err)
      })

    supertest(app)
      .get('/')
      .set(XFF_HEADER, '10.1.1.1')
      .expect(429)
      .end((err, res) => {
        expect(res.text).toBe('You have exceeded your request rate of 1 r/s.')
        done(err)
      })
  })

  it('should ignore xff when value is invalid', done => {
    done = after(2, done)

    const app = express()
    app.use(
      slowDown({
        burst: 1,
        rate: 1,
        xff: true,
        overrides: {
          '10.1.1.192/27': {
            burst: 2,
            rate: 2,
          },
        },
      })
    )

    app.get('/', (req, res, next) => {
      res.send('hello')
    })

    app.use(errorHandler)

    supertest(app)
      .get('/')
      .set(XFF_HEADER, 'abcxyz')
      .expect(200)
      .end((err, res) => {
        expect(res.text).toBe('hello')
        done(err)
      })

    supertest(app)
      .get('/')
      .set(XFF_HEADER, 'abcxyz')
      .expect(429)
      .end((err, res) => {
        expect(res.text).toBe('You have exceeded your request rate of 1 r/s.')
        done(err)
      })
  })
})

function errorHandler(err, req, res, next) {
  res.status(err.status || 500)
  res.send(err.message)
}
