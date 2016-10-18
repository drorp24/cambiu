Rails.application.config.assets.configure do |env|
  Sprockets::Commoner::Processor.configure(env,
     # include, exclude, and babel_exclude patterns can be path prefixes or regexes.
     # Explicitely list paths to include. The default is `[env.root]`
     include: ['app/assets/javascripts'],
     # List files to ignore and not process require calls or apply any Babel transforms to. Default is ['vendor/bundle'].
     #exclude: ['vendor/bundle', /ignored/],
     # Anything listed in babel_exclude has its require calls resolved, but no transforms listed in .babelrcs applied.
     # Default is [/node_modules/]
     #babel_exclude: [/node_modules/]
  )
end