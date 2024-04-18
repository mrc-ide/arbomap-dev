#!/usr/bin/env Rscript
process_country <- function(x, level) {
  if (level == 1) {
    id <- sprintf("%s.%s_1", x$ISO, trimws(x$ID_1))
  }
  if (level == 2) {
    id <- sprintf("%s.%s.%s_1", x$ISO, trimws(x$ID_1), trimws(x$ID_2))
  }
  g <- function(i) {
    el <- x[i, ]
    list(
      FOI = list(mean = el$mean_FOI, sd = el$sd_FOI),
      serop9 = list(mean = el$mean_p9, sd = el$sd_p9))
  }
  setNames(lapply(seq_len(nrow(x)), g), id)
}

process <- function(path, dest, level) {
  dat <- readxl::read_excel(path)
  # There are some NAs in the current dataset - Clare is looking into this.
  dat <- dat[!is.na(dat$ISO), ]
  dir.create(dest, FALSE, TRUE)
  # also output array of countries
  countries <- c()
  for (iso in unique(dat$ISO)) {
    json <- jsonlite::toJSON(
      process_country(dat[dat$ISO == iso, ], level), auto_unbox = TRUE)
    writeLines(json, file.path(dest, paste0(iso, ".json")))
    countries <- append(countries, iso)
  }
  if (level == 1) {
    writeLines(jsonlite::toJSON(countries), file.path(dest, "_countries.json"))
  }
}

root <- here::here()
process(file.path(root, "data/raw/Admin_1_Estimates_v2.xlsx"),
        file.path(root, "data/processed/admin1"),
        1)
process(file.path(root, "data/raw/Admin_2_Estimates.xlsx"),
        file.path(root, "data/processed/admin2"),
        2)


