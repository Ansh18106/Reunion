import chai from "chai";
import chaiHttp from "chai-http";
import mocha from "mocha";
import { app } from "./app.js";

chai.should();

chai.use(chaiHttp);

describe('Test APIs', () => {
    // retrieving post
    describe('api/posts/{id}', () => {
        it('1', (done) => {
            chai.request(app)
            .get('/api/posts/64343f7f9dae3a999c686193')
            .end((err, res) => {
                const keys = Object.keys(res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.to.have.all.keys(
                    'id',
                    'title',
                    'description',
                    'creation_time',
                    'likes',
                    'comments'
                );
                done();
            });
        });
    });

    // getting user data without authentication
    describe('api/user', () => {
        it("2", (done) => {
            chai.request(app)
            .get('/api/user')
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Please Login');
                done();
            });
        });
    });

    // authentucation
    describe('api/authenticate', () => {
        it("3", (done) => {
            const task = {
                "email": "e3",
                "password": "password3"
            }
            chai.request(app)
            .post('/api/authenticate')
            .send(task)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('token');
                // done();
            });
            chai.request(app)
            .post('/api/logout')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Please login');
                done();
            });
        });
    });

    describe('api/authenticate', () => {
        it("4", (done) => {
            const task = {
                "email": "e342",
                "password": "password3"
            }
            chai.request(app)
            .post('/api/authenticate')
            .send(task)
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('This email is not registered: (');
                done();
            });
        });
    });

    describe('api/authenticate', () => {
        it("5", (done) => {
            const task = {
                "email": "e3",
                "password": "password32"
            }
            chai.request(app)
            .post('/api/authenticate')
            .send(task)
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Wrong Password! Please try again');
                done();
            });
        });
    });


    describe('api/user', () => {
        it("6", (done) => {
            const task = {
                "email": "e3",
                "password": "password3"
            };
            chai.request(app)
            .post('/api/authenticate')
            .send(task);

            // chai.request(app)
            // .get('/api/user')
            // .end((err, res) => {
            //     res.body.should.be.a('object');
            //     res.should.have.status(200);
            //     res.body.should.have.property('name');
            //     res.body.should.have.property('followers');
            //     res.body.should.have.property('following');
            //     // done();
            // });

            chai.request(app)
            .post('/api/logout')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Please login');
                done();
            });
        });
    });

    // describe('api/createUser', () => {
    //     it("7", (done) => {
    //         const task = {
    //             "name": "n10",
    //             "email": "e10",
    //             "password": "Password10"
    //         };

    //         chai.request(app)
    //         .post('/api/createUser')
    //         .send(task)
    //         .end((err, res) => {
    //             res.should.have.status(201);
    //             res.body.should.be.a('object');
    //             res.body.should.have.property('name');
    //             res.body.should.have.property('email');
    //             res.body.should.have.property('password');
    //             res.body.should.have.property('posts');
    //             res.body.should.have.property('_id');
    //             res.body.should.have.property('followers');
    //             res.body.should.have.property('following');
    //             res.body.should.have.property('following');
    //             res.body.should.have.property('__v');
    //             done();
    //         });

    //     });
    // });
    
    // creating post
    // describe('api/posts/{id}', () => {
    //     it('', (done) => {
    //         const task = {

    //         }
    //         chai.request(app)
    //         .post('/api/posts')
    //         .end((err, res) => {
    //             const keys = Object.keys(res.body);
    //             res.should.have.status(200);
    //             res.body.should.be.a('object');
    //             res.body.should.to.have.all.keys(
    //                 'id',
    //                 'title',
    //                 'description',
    //                 'creation_time',
    //                 'likes',
    //                 'comments'
    //             );
    //             done();
    //         })
    //     })
    // });
});