const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

describe("Login and Access Control Test", () => {
  const agent = chai.request.agent("http://localhost:8080");

  it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/b2xVn2"', () => {
    const agent = chai.request.agent("http://localhost:8080");
    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user2@example.com", password: "dishwasher-funk" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/i3BoGr").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });

  it('should redirect to /login with status code 302', function() {
    const agent = chai.request.agent("http://localhost:8080");

    return agent
      .get('/')
      .end((err, res) => {
        expect(res).to.redirectTo('http://localhost:8080/login');
        expect(res).to.have.status(302);
        done();
      });
  });
  // Test case: GET request to "/urls/new"
  it('should redirect to /login with status code 302', function() {
    return agent
      .get('/urls/new')
      .end((err, res) => {
        expect(res).to.redirectTo('http://localhost:8080/login');
        expect(res).to.have.status(302);
        done();
      });
  });

  // Test case: GET request to "/urls/NOTEXISTS"
  it('should return status code 404 for non-existent URL', function() {
    return agent
      .get('/urls/NOTEXISTS')
      .then(function(res) {
        expect(res).to.have.status(404);
      });
  });

  // Test case: GET request to "/urls/b2xVn2"
  it('should return status code 403 for existing URL', function() {
    return agent
      .get('/urls/b2xVn2')
      .end((err, res) => {
        expect(res).to.have.status(403);
        done();
      });
  });

  // Close the agent after all tests are done
  after(function() {
    agent.close();
  });
});