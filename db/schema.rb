# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150414164832) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_admin_comments", force: true do |t|
    t.string   "namespace"
    t.text     "body"
    t.string   "resource_id",   null: false
    t.string   "resource_type", null: false
    t.integer  "author_id"
    t.string   "author_type"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "active_admin_comments", ["author_type", "author_id"], :name => "index_active_admin_comments_on_author_type_and_author_id"
  add_index "active_admin_comments", ["namespace"], :name => "index_active_admin_comments_on_namespace"
  add_index "active_admin_comments", ["resource_type", "resource_id"], :name => "index_active_admin_comments_on_resource_type_and_resource_id"

  create_table "admin_users", force: true do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "admin_users", ["email"], :name => "index_admin_users_on_email", :unique => true
  add_index "admin_users", ["reset_password_token"], :name => "index_admin_users_on_reset_password_token", :unique => true

  create_table "business_hours", force: true do |t|
    t.integer  "exchange_id"
    t.integer  "day"
    t.time     "open1"
    t.time     "close1"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.time     "open2"
    t.time     "close2"
  end

  add_index "business_hours", ["exchange_id", "day"], :name => "index_business_hours_on_exchange_id_and_day"
  add_index "business_hours", ["exchange_id"], :name => "index_business_hours_on_exchange_id"

  create_table "chains", force: true do |t|
    t.text     "name"
    t.string   "email"
    t.string   "url"
    t.integer  "plan"
    t.string   "phone"
    t.string   "prices_published"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "exchanges", force: true do |t|
    t.string   "name"
    t.string   "address"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "latitude"
    t.float    "longitude"
    t.string   "country"
    t.time     "opens"
    t.time     "closes"
    t.string   "website"
    t.string   "email"
    t.text     "note"
    t.string   "phone"
    t.string   "addr_country"
    t.string   "addr_city"
    t.string   "addr_street"
    t.string   "addr_housename"
    t.string   "addr_housenumber"
    t.string   "addr_postcode"
    t.string   "addr_unit"
    t.string   "osm_id"
    t.boolean  "atm"
    t.string   "source"
    t.integer  "business_type"
    t.integer  "chain_id"
    t.string   "city"
    t.string   "region"
    t.float    "rating"
    t.string   "nearest_station"
    t.boolean  "airport"
    t.string   "directory"
    t.boolean  "accessible"
    t.integer  "upload_id"
    t.integer  "admin_user_id"
    t.string   "status"
    t.text     "message"
  end

  add_index "exchanges", ["chain_id"], :name => "index_exchanges_on_chain_id"
  add_index "exchanges", ["latitude", "longitude"], :name => "index_exchanges_on_latitude_and_longitude"
  add_index "exchanges", ["latitude"], :name => "index_exchanges_on_latitude"
  add_index "exchanges", ["longitude"], :name => "index_exchanges_on_longitude"
  add_index "exchanges", ["name", "address"], :name => "index_exchanges_on_name_and_address"

  create_table "rates", force: true do |t|
    t.integer  "exchange_id"
    t.integer  "buy_cents"
    t.string   "buy_currency"
    t.integer  "pay_cents"
    t.string   "pay_currency"
    t.integer  "source"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "category"
    t.integer  "up_to_cents"
    t.string   "up_to_currency"
    t.integer  "chain_id"
  end

  add_index "rates", ["chain_id"], :name => "index_rates_on_chain_id"
  add_index "rates", ["exchange_id"], :name => "index_rates_on_exchange_id"

  create_table "s_currencies", force: true do |t|
    t.integer  "source_id"
    t.string   "name"
    t.string   "iso_code"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "s_currencies", ["source_id"], :name => "index_s_currencies_on_source_id"

  create_table "searches", force: true do |t|
    t.string   "pay_currency"
    t.string   "buy_currency"
    t.string   "pay_amount"
    t.string   "buy_amount"
    t.string   "location"
    t.string   "user_lat"
    t.string   "user_lng"
    t.string   "user_location"
    t.decimal  "distance"
    t.string   "distance_unit"
    t.string   "sort"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "sources", force: true do |t|
    t.text     "url"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "uploads", force: true do |t|
    t.integer  "source_type"
    t.string   "file_location"
    t.string   "file_name"
    t.integer  "records_created"
    t.integer  "records_updated"
    t.integer  "admin_user_id"
    t.datetime "upload_start"
    t.datetime "upload_finished"
    t.integer  "upload_status"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "uploads", ["admin_user_id"], :name => "index_uploads_on_admin_user_id"

  create_table "users", force: true do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "buy_currency"
    t.string   "pay_currency"
    t.string   "provider"
    t.string   "uid"
    t.string   "name"
    t.string   "image"
    t.string   "location"
    t.string   "first_name"
    t.string   "last_name"
    t.string   "gender"
    t.string   "timezone"
    t.string   "locale"
    t.boolean  "guest"
    t.string   "landing"
    t.string   "buy_amount"
    t.string   "pay_amount"
    t.float    "latitude"
    t.float    "longitude"
    t.float    "bbox"
    t.string   "location_search"
    t.string   "geocoded_location"
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

  create_table "visitors", force: true do |t|
    t.integer  "buy_cents"
    t.string   "buy_currency"
    t.integer  "pay_cents"
    t.string   "pay_currency"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "email"
  end

end
