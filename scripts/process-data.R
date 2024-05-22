#!/usr/bin/env Rscript
process_country <- function(x, country_codes, level) {
  if (level == 1) {
    id <- trimws(x$ID_1)
  }
  if (level == 2) {
    id <- trimws(x$ID_2)
  }
  
  g <- function(i) {
    el <- x[i, ]
    list(
      FOI = list(mean = el$mean_FOI, sd = el$sd_FOI),
      serop9 = list(mean = el$mean_p9, sd = el$sd_p9),
      serop9_class = list(mean = el$mean_p9, sd = el$sd_p9),  # repeat serop_9 values for category indicator
      hosp_total = list(mean = el$mean_hosp_total, sd = el$sd_hosp_total),
      hosp_0_4 = list(mean = el$mean_hosp_0_4, sd = el$sd_hosp_0_4),
      hosp_5_9 = list(mean = el$mean_hosp_5_9, sd = el$sd_hosp_5_9),
      hosp_10_14 = list(mean = el$mean_hosp_10_14, sd = el$sd_hosp_10_14),
      hosp_15_19 = list(mean = el$mean_hosp_15_19, sd = el$sd_hosp_15_19),
      hosp_20_24 = list(mean = el$mean_hosp_20_24, sd = el$sd_hosp_20_24),
      hosp_25_29 = list(mean = el$mean_hosp_25_29, sd = el$sd_hosp_25_29),
      hosp_30_34 = list(mean = el$mean_hosp_30_34, sd = el$sd_hosp_30_34),
      hosp_35_39 = list(mean = el$mean_hosp_35_39, sd = el$sd_hosp_35_39),
      hosp_40_44 = list(mean = el$mean_hosp_40_44, sd = el$sd_hosp_40_44),
      hosp_45_49 = list(mean = el$mean_hosp_45_49, sd = el$sd_hosp_45_49),
      hosp_50_54 = list(mean = el$mean_hosp_50_54, sd = el$sd_hosp_50_54),
      hosp_55_59 = list(mean = el$mean_hosp_55_59, sd = el$sd_hosp_55_59),
      hosp_60_64 = list(mean = el$mean_hosp_60_64, sd = el$sd_hosp_60_64),
      hosp_65_69 = list(mean = el$mean_hosp_65_69, sd = el$sd_hosp_65_69),
      hosp_70_74 = list(mean = el$mean_hosp_70_74, sd = el$sd_hosp_70_74),
      hosp_75_79 = list(mean = el$mean_hosp_75_79, sd = el$sd_hosp_75_79),
      hosp_80_84 = list(mean = el$mean_hosp_80_84, sd = el$sd_hosp_80_84),
      hosp_85_89 = list(mean = el$mean_hosp_85_89, sd = el$sd_hosp_85_89),
      hosp_90_94 = list(mean = el$mean_hosp_90_94, sd = el$sd_hosp_90_94),
      hosp_95_99 = list(mean = el$mean_hosp_95_99, sd = el$sd_hosp_95_99))
  }
  setNames(lapply(seq_len(nrow(x)), g), id)
}

process <- function(path, dest, level) {
  dat <- readxl::read_excel(path)
  dir.create(dest, FALSE, TRUE)
  countries <- unique(dat$ID_0)
  # we deliberately exclude these countries which have values derived from
  # neighbouring countries
  countries <- countries[!(countries %in% c("ASM", "CYM", "DMA", "KNA", "MNP", "MSR", "NRU", "PLW", "TCA", "TUV", "VGB", "WLF"))]

  if (level == 2) {
    for (iso in countries) {
      json <- jsonlite::toJSON(
        process_country(dat[dat$ID_0 == iso, ], country_codes, level), auto_unbox = TRUE)
      writeLines(json, file.path(dest, paste0(iso, ".json")))
    }
  }

  if (level == 1) {
    # output a single file, and also output array of countries
    data_by_country <- list()
    for (iso in countries) {
      data_by_country[[iso]] = process_country(dat[dat$ID_0 == iso, ], country_codes, level)
    }
    json <- jsonlite::toJSON(data_by_country, auto_unbox = TRUE)
    writeLines(json, file.path(dest, paste0("global_adm1.json")))
    writeLines(jsonlite::toJSON(countries), file.path(dest, "_countries.json"))
  }
}

#root <- here::here()
root <- "/home/emma/dev/arbomap"
process(file.path(root, "data/raw/Adm1_Estimates_v3_gadm41_filled_gaps.xlsx"),
        file.path(root, "data/processed/admin1"),
        1)
process(file.path(root, "data/raw/Adm2_Estimates_v3_gadm41_filled_gaps.xlsx"),
        file.path(root, "data/processed/admin2"),
       2)


