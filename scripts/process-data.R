#!/usr/bin/env Rscript
process_country <- function(x, country_codes, level) {
  if (level == 1) {
    id <- trimws(x$GID_1)
  }
  if (level == 2) {
    id <- trimws(x$GID_2)
  }
  
  # TODO: output sd as 0 for now, awaiting Ilaria to confirm if we don't want it
  g <- function(i) {
    el <- x[i, ]
    list(
      FOI = list(mean = el$FOI, sd = 0),
      serop9 = list(mean = el$p9, sd = 0))
  }
  setNames(lapply(seq_len(nrow(x)), g), id)
}

process <- function(path, dest, level) {
  dat <- readxl::read_excel(path)
  # There are some NAs in the current dataset - Clare is looking into this.
  #dat <- dat[!is.na(dat$ISO), ]
  dir.create(dest, FALSE, TRUE)
  # also output array of countries
  countries <- c()
  for (iso in unique(dat$ISO)) {
    json <- jsonlite::toJSON(
      process_country(dat[dat$ISO == iso, ], country_codes, level), auto_unbox = TRUE)
    writeLines(json, file.path(dest, paste0(iso, ".json")))
    countries <- append(countries, iso)
  }
  if (level == 1) {
    writeLines(jsonlite::toJSON(countries), file.path(dest, "_countries.json"))
  }
}

root <- here::here()
process(file.path(root, "data/raw/Adm1_Estimates_gadm41.xlsx"),
        file.path(root, "data/processed/admin1"),
        1)
process(file.path(root, "data/raw/Adm2_Estimates_gadm41.xlsx"),
        file.path(root, "data/processed/admin2"),
        2)


