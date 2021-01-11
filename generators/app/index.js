"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const glob = require("globby");
const { resolve } = require("path");
const remote = require("yeoman-remote");
const yoHelper = require("@jswork/yeoman-generator-helper");
const replace = require("replace-in-file");
const fs = require("fs");

require("@jswork/next-registry-choices");
require("@jswork/next-deep-assign");

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the stunning ${chalk.red(
          "generator-generator-storybook"
        )} generator!`
      )
    );

    const prompts = [
      {
        type: "input",
        name: "scope",
        message: "Your scope (eg: `babel` )?",
        default: "jswork"
      },
      {
        type: "list",
        name: "registry",
        message: "Your registry",
        choices: nx.RegistryChoices.gets()
      },
      {
        type: "input",
        name: "project_name",
        message: "Your project_name (eg: like this `react-button` )?",
        default: yoHelper.discoverRoot
      },
      {
        type: "input",
        name: "description",
        message: "Your description?"
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
      yoHelper.rewriteProps(props);
    });
  }

  writing() {
    const done = this.async();

    remote("afeiship", "boilerplate-storybook", (_, cachePath) => {
      const options = { cwd: cachePath, absolute: true };
      this.fs.copyTpl(
        glob.sync(["{**,.storybook/*}", "!*.md", "!.gitignore"], options),
        this.destinationPath(),
        this.props
      );
      done();
    });
  }

  end() {
    const dest = this.destinationPath();
    const pkgPath = resolve(dest, "package.json");
    const partialPath = resolve(dest, "package.partial.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = nx.deepAssign(require(pkgPath), require(partialPath));
      this.fs.delete(partialPath);
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    }
  }
};
