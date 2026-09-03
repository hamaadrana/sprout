# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_09_03_150000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "activities", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "duration_minutes", default: 10, null: false
    t.text "instructions", null: false
    t.string "kind", default: "hands_on", null: false
    t.string "materials", default: [], null: false, array: true
    t.integer "position", default: 0, null: false
    t.bigint "skill_id", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["skill_id", "position"], name: "index_activities_on_skill_id_and_position"
    t.index ["skill_id"], name: "index_activities_on_skill_id"
  end

  create_table "child_domains", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.bigint "child_id", null: false
    t.datetime "created_at", null: false
    t.bigint "domain_id", null: false
    t.datetime "updated_at", null: false
    t.index ["child_id", "domain_id"], name: "index_child_domains_on_child_id_and_domain_id", unique: true
    t.index ["child_id"], name: "index_child_domains_on_child_id"
    t.index ["domain_id"], name: "index_child_domains_on_domain_id"
  end

  create_table "children", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.date "date_of_birth", null: false
    t.string "framing", default: "coverage", null: false
    t.string "gender"
    t.string "goals", default: [], null: false, array: true
    t.string "head_start_codes", default: [], null: false, array: true
    t.string "name", null: false
    t.date "target_school_start_on"
    t.jsonb "traits", default: {}, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_children_on_user_id"
  end

  create_table "domains", force: :cascade do |t|
    t.string "code", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.string "name_ur"
    t.integer "position", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_domains_on_code", unique: true
  end

  create_table "library_activities", force: :cascade do |t|
    t.string "age_band", null: false
    t.string "code", null: false
    t.datetime "created_at", null: false
    t.string "domain_code", null: false
    t.integer "duration_minutes", default: 10, null: false
    t.text "instructions", null: false
    t.string "materials", default: [], null: false, array: true
    t.string "skill_tags", default: [], null: false, array: true
    t.boolean "supervision", default: false, null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.text "variation"
    t.index ["age_band", "domain_code"], name: "index_library_activities_on_age_band_and_domain_code"
    t.index ["code"], name: "index_library_activities_on_code", unique: true
  end

  create_table "log_entries", force: :cascade do |t|
    t.bigint "child_id", null: false
    t.datetime "created_at", null: false
    t.date "logged_on", null: false
    t.integer "minutes"
    t.text "note"
    t.string "outcome", null: false
    t.bigint "plan_item_id"
    t.bigint "skill_id", null: false
    t.datetime "updated_at", null: false
    t.index ["child_id", "logged_on"], name: "index_log_entries_on_child_id_and_logged_on"
    t.index ["child_id"], name: "index_log_entries_on_child_id"
    t.index ["plan_item_id"], name: "index_log_entries_on_plan_item_id"
    t.index ["skill_id"], name: "index_log_entries_on_skill_id"
  end

  create_table "make_projects", force: :cascade do |t|
    t.text "adult_prep"
    t.string "age_band", null: false
    t.string "category", null: false
    t.string "code", null: false
    t.datetime "created_at", null: false
    t.string "develops", default: [], null: false, array: true
    t.integer "duration_minutes", default: 20, null: false
    t.string "materials", default: [], null: false, array: true
    t.string "mess_level", default: "low", null: false
    t.string "occasion"
    t.boolean "portfolio", default: false, null: false
    t.string "skill_tags", default: [], null: false, array: true
    t.string "steps", default: [], null: false, array: true
    t.boolean "supervision", default: false, null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["age_band", "category"], name: "index_make_projects_on_age_band_and_category"
    t.index ["code"], name: "index_make_projects_on_code", unique: true
  end

  create_table "plan_items", force: :cascade do |t|
    t.bigint "activity_id", null: false
    t.bigint "child_id", null: false
    t.datetime "created_at", null: false
    t.integer "position", default: 0, null: false
    t.date "scheduled_on", null: false
    t.bigint "skill_id", null: false
    t.string "state", default: "pending", null: false
    t.datetime "updated_at", null: false
    t.index ["activity_id"], name: "index_plan_items_on_activity_id"
    t.index ["child_id", "scheduled_on", "position"], name: "index_plan_items_on_child_id_and_scheduled_on_and_position", unique: true
    t.index ["child_id"], name: "index_plan_items_on_child_id"
    t.index ["skill_id"], name: "index_plan_items_on_skill_id"
  end

  create_table "portfolio_items", force: :cascade do |t|
    t.string "caption"
    t.bigint "child_id", null: false
    t.datetime "created_at", null: false
    t.bigint "skill_id"
    t.date "taken_on", null: false
    t.datetime "updated_at", null: false
    t.index ["child_id", "taken_on"], name: "index_portfolio_items_on_child_id_and_taken_on"
    t.index ["child_id"], name: "index_portfolio_items_on_child_id"
    t.index ["skill_id"], name: "index_portfolio_items_on_skill_id"
  end

  create_table "resources", force: :cascade do |t|
    t.bigint "activity_id", null: false
    t.datetime "created_at", null: false
    t.string "kind", null: false
    t.datetime "updated_at", null: false
    t.string "url"
    t.jsonb "worksheet_params", default: {}, null: false
    t.string "worksheet_template"
    t.index ["activity_id"], name: "index_resources_on_activity_id"
  end

  create_table "skill_prerequisites", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "prerequisite_skill_id", null: false
    t.bigint "skill_id", null: false
    t.datetime "updated_at", null: false
    t.index ["prerequisite_skill_id"], name: "index_skill_prerequisites_on_prerequisite_skill_id"
    t.index ["skill_id", "prerequisite_skill_id"], name: "idx_on_skill_id_prerequisite_skill_id_e3e324ab28", unique: true
    t.index ["skill_id"], name: "index_skill_prerequisites_on_skill_id"
  end

  create_table "skill_progress", force: :cascade do |t|
    t.integer "attempts_count", default: 0, null: false
    t.bigint "child_id", null: false
    t.datetime "created_at", null: false
    t.datetime "introduced_at"
    t.datetime "mastered_at"
    t.bigint "skill_id", null: false
    t.string "state", default: "not_started", null: false
    t.datetime "updated_at", null: false
    t.index ["child_id", "skill_id"], name: "index_skill_progress_on_child_id_and_skill_id", unique: true
    t.index ["child_id", "state"], name: "index_skill_progress_on_child_id_and_state"
    t.index ["child_id"], name: "index_skill_progress_on_child_id"
    t.index ["skill_id"], name: "index_skill_progress_on_skill_id"
  end

  create_table "skills", force: :cascade do |t|
    t.integer "age_max_months", null: false
    t.integer "age_min_months", null: false
    t.string "code", null: false
    t.datetime "created_at", null: false
    t.bigint "domain_id", null: false
    t.text "mastery_descriptor", null: false
    t.integer "position", default: 0, null: false
    t.boolean "school_readiness", default: false, null: false
    t.string "slo_refs", default: [], null: false, array: true
    t.string "strand"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_skills_on_code", unique: true
    t.index ["domain_id", "position"], name: "index_skills_on_domain_id_and_position"
    t.index ["domain_id"], name: "index_skills_on_domain_id"
  end

  create_table "terms", force: :cascade do |t|
    t.bigint "child_id", null: false
    t.datetime "created_at", null: false
    t.date "ends_on", null: false
    t.string "name", null: false
    t.date "starts_on", null: false
    t.datetime "updated_at", null: false
    t.index ["child_id"], name: "index_terms_on_child_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "city"
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "name"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.string "timezone", default: "Asia/Karachi", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "worksheets", force: :cascade do |t|
    t.string "code", null: false
    t.datetime "created_at", null: false
    t.string "domain_code", null: false
    t.integer "level", default: 1, null: false
    t.jsonb "params", default: {}, null: false
    t.integer "position", default: 0, null: false
    t.string "skill_code"
    t.string "template", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_worksheets_on_code", unique: true
    t.index ["domain_code", "position"], name: "index_worksheets_on_domain_code_and_position"
    t.index ["skill_code"], name: "index_worksheets_on_skill_code"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "activities", "skills"
  add_foreign_key "child_domains", "children"
  add_foreign_key "child_domains", "domains"
  add_foreign_key "children", "users"
  add_foreign_key "log_entries", "children"
  add_foreign_key "log_entries", "plan_items"
  add_foreign_key "log_entries", "skills"
  add_foreign_key "plan_items", "activities"
  add_foreign_key "plan_items", "children"
  add_foreign_key "plan_items", "skills"
  add_foreign_key "portfolio_items", "children"
  add_foreign_key "portfolio_items", "skills"
  add_foreign_key "resources", "activities"
  add_foreign_key "skill_prerequisites", "skills"
  add_foreign_key "skill_prerequisites", "skills", column: "prerequisite_skill_id"
  add_foreign_key "skill_progress", "children"
  add_foreign_key "skill_progress", "skills"
  add_foreign_key "skills", "domains"
  add_foreign_key "terms", "children"
end
