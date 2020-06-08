const { src, dest, parallel, series, watch } = require("gulp");

const del = require("del");

const browsersync = require("browser-sync");

const loadPlugins = require("gulp-load-plugins");

const plugins = loadPlugins();

const bs = browsersync.create();

const data = {
  menus: [
    {
      name: "Home",
      icon: "aperture",
      link: "index.html"
    },
    {
      name: "Features",
      link: "features.html"
    },
    {
      name: "About",
      link: "about.html"
    },
    {
      name: "Contact",
      link: "#",
      children: [
        {
          name: "Twitter",
          link: "https://twitter.com/"
        },
        {
          name: "About",
          link: "https://weibo.com/"
        },
        {
          name: "divider"
        },
        {
          name: "About",
          link: "https://github.com/"
        }
      ]
    }
  ],
  pkg: require("./package.json"),
  date: new Date()
};

const clean = () => {
  return del(["dist", "temp"]);
};

const style = () => {
  return src("src/assets/styles/*.scss", { base: "src" })
    .pipe(plugins.sass({ outputStyle: "expanded" }))
    .pipe(dest("temp"))
    .pipe(bs.reload({ stream: true }));
};

const script = () => {
  return src("src/assets/scripts/*.js", { base: "src" })
    .pipe(plugins.babel({ presets: ["@babel/preset-env"] }))
    .pipe(dest("temp"))
    .pipe(bs.reload({ stream: true }));
};

const page = () => {
  return src("src/*.html", { base: "src" })
    .pipe(plugins.swig({ data, defaults: { cache: false } }))
    .pipe(dest("temp"))
    .pipe(bs.reload({ stream: true }));
};

const image = () => {
  return src("src/assets/images/**", { base: "src" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};

const font = () => {
  return src("src/assets/fonts/**", { base: "src" })
    .pipe(plugins.imagemin())
    .pipe(dest("dist"));
};

const extra = () => {
  return src("public/**", { base: "public" }).pipe(dest("dist"));
};

const serve = () => {
  watch("src/assets/styles/*.scss", style);
  watch("src/assets/scripts/*.js", script);
  watch("src/*.html", page);

  watch(
    ["src/assets/images/**", "src/assets/fonts/**", "public/**"],
    bs.reload
  );

  bs.init({
    notify: false,
    port: 8080,
    server: {
      baseDir: ["temp", "src", "public"],
      routes: {
        "/node_modules": "node_modules"
      }
    }
  });
};

const useref = () => {
  return src("temp/*.html", { base: "temp" })
    .pipe(plugins.useref({ searchPath: ["temp", "."] }))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(
      plugins.if(
        /\.html$/,
        plugins.htmlmin({
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true
        })
      )
    )
    .pipe(dest("dist"));
};

const compile = parallel(style, script, page);

const build = series(
  clean,
  parallel(series(compile, useref), image, font, extra)
);

const develop = series(compile, serve);

module.exports = { clean, build, develop };
