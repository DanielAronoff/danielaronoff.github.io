# Cache-busting asset versions derived from asset *content* instead of build time.
#
# This previously used site.time, so every build rewrote the ?v= query string on
# every page. That meant a rebuild with no source changes still showed all of
# docs/ as modified, which made "docs/ is dirty" useless as a signal that a real
# change was pending -- and let a genuinely stale docs/ go unnoticed.
#
# Runs locally only: GitHub Pages serves docs/ as static files (docs/.nojekyll),
# so it never invokes Jekyll on this repo.
#
# Exposed to Liquid as site.asset_versions.css / site.asset_versions.js.
require "digest"

module AssetVersions
  # Every source file that can change the built asset. Sass partials are listed
  # explicitly because main.scss @use's them -- hashing main.scss alone would
  # miss any edit under _sass/.
  SOURCES = {
    "css" => ["assets/css/main.scss", "_sass/**/*.scss"],
    "js"  => ["assets/js/main.js"],
  }.freeze

  class Generator < Jekyll::Generator
    safe true
    priority :highest

    def generate(site)
      site.config["asset_versions"] = SOURCES.transform_values do |patterns|
        version_for(site, patterns)
      end
    end

    private

    def version_for(site, patterns)
      files = patterns
              .flat_map { |pattern| Dir.glob(File.join(site.source, pattern)) }
              .select { |path| File.file?(path) }
              .uniq
              .sort

      Jekyll.logger.warn("AssetVersions:", "no files matched #{patterns.inspect}") if files.empty?

      digest = Digest::SHA256.new
      files.each do |path|
        # Include the path so renaming a partial changes the version too.
        digest << path.sub("#{site.source}/", "") << "\0"
        digest << File.binread(path) << "\0"
      end
      digest.hexdigest[0, 12]
    end
  end
end
