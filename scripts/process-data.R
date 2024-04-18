#!/usr/bin/env Rscript
process_country <- function(x) {
  id <- sprintf("%s.%s_1", x$IS0, trimws(x$ID_1))
  g <- function(i) {
    el <- x[i, ]
    list(
      FOI = list(mean = el$mean_FOI, sd = el$sd_FOI),
      serop9 = list(mean = el$mean_p9, sd = el$sd_p9))
  }
  setNames(lapply(seq_len(nrow(x)), g), id)
}

process <- function(path, dest) {
  dat <- readxl::read_excel(path)
  dir.create(dest, FALSE, TRUE)
  # also output array of countries
  countries <- c()
  for (iso in unique(dat$IS0)) {
    json <- jsonlite::toJSON(
      process_country(dat[dat$IS0 == iso, ]), auto_unbox = TRUE)
    writeLines(json, file.path(dest, paste0(iso, ".json")))
    countries <- append(countries, iso)
  }
  writeLines(jsonlite::toJSON(countries), file.path(dest, "_countries.json"))
}

root <- here::here()
process(file.path(root, "data/raw/Admin_1_Estimates_v2.xlsx"),
        file.path(root, "data/processed/admin1"))
