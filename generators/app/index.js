"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const glob = require("globby");
const remote = require("yeoman-remote");
const yoHelper = require("@jswork/yeoman-generator-helper");
const fs = require("fs");
const prompts = require("./prompts");

require("@jswork/next-deep-assign");

module.exports = class extends Generator {
  prompting() {
    this.log(
      yosay(
        `Welcome to the stunning ${chalk.red(
          "generator-generator-storybook"
        )} generator!`
      )
    );

    return this.prompt(prompts).then(props => {
      this.props = props;
      yoHelper.rewriteProps(props);
    });
  }

  writing() {
    const done = this.async();

    remote("afeiship", "boilerplate-storybook", (_, cachePath) => {
      const options = { cwd: cachePath, absolute: true };
      const patterns = ["{**,.storybook/*}", "!*.md", "!.gitignore"];
      this.fs.copyTpl(
        glob.sync(patterns, options),
        this.destinationPath(),
        this.props
      );
      done();
    });
  }

  end() {
    const pkgPath = this.destinationPath("package.json");
    const partialPath = this.destinationPath("package.partial.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = nx.deepAssign(require(pkgPath), require(partialPath));
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      fs.unlinkSync(partialPath);
    }
  }
};
