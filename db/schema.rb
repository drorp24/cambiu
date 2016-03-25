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

ActiveRecord::Schema.define(version: 20160324231000) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "pg_stat_statements"

  create_table "active_admin_comments", force: :cascade do |t|
    t.string   "namespace",     limit: 255
    t.text     "body"
    t.string   "resource_id",   limit: 255, null: false
    t.string   "resource_type", limit: 255, null: false
    t.integer  "author_id"
    t.string   "author_type",   limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "active_admin_comments", ["author_type", "author_id"], name: "index_active_admin_comments_on_author_type_and_author_id", using: :btree
  add_index "active_admin_comments", ["namespace"], name: "index_active_admin_comments_on_namespace", using: :btree
  add_index "active_admin_comments", ["resource_type", "resource_id"], name: "index_active_admin_comments_on_resource_type_and_resource_id", using: :btree

  create_table "admin_users", force: :cascade do |t|
    t.string   "email",                  limit: 255, default: "", null: false
    t.string   "encrypted_password",     limit: 255, default: "", null: false
    t.string   "reset_password_token",   limit: 255
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                      default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "admin_users", ["email"], name: "index_admin_users_on_email", unique: true, using: :btree
  add_index "admin_users", ["reset_password_token"], name: "index_admin_users_on_reset_password_token", unique: true, using: :btree

  create_table "business_hours", force: :cascade do |t|
    t.integer  "exchange_id"
    t.integer  "day"
    t.time     "open1"
    t.time     "close1"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.time     "open2"
    t.time     "close2"
  end

  add_index "business_hours", ["exchange_id", "day"], name: "index_business_hours_on_exchange_id_and_day", using: :btree
  add_index "business_hours", ["exchange_id"], name: "index_business_hours_on_exchange_id", using: :btree

  create_table "chains", force: :cascade do |t|
    t.text     "name"
    t.string   "email",        limit: 255
    t.string   "url",          limit: 255
    t.integer  "plan"
    t.string   "phone",        limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "rates_source"
    t.datetime "rates_update"
    t.string   "currency"
  end

  create_table "emails", force: :cascade do |t|
    t.integer  "emailable_id"
    t.string   "emailable_type"
    t.string   "from"
    t.string   "to"
    t.string   "status"
    t.string   "mandrill_id"
    t.string   "reject_reason"
    t.integer  "order_status"
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
  end

  add_index "emails", ["emailable_type", "emailable_id"], name: "index_emails_on_emailable_type_and_emailable_id", using: :btree

  create_table "exchanges", force: :cascade do |t|
    t.string   "name",              limit: 255
    t.string   "address",           limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "latitude"
    t.float    "longitude"
    t.string   "country",           limit: 255
    t.time     "opens"
    t.time     "closes"
    t.string   "website",           limit: 255
    t.string   "email",             limit: 255
    t.text     "note"
    t.string   "phone",             limit: 255
    t.string   "addr_country",      limit: 255
    t.string   "addr_city",         limit: 255
    t.string   "addr_street",       limit: 255
    t.string   "addr_housename",    limit: 255
    t.string   "addr_housenumber",  limit: 255
    t.string   "addr_postcode",     limit: 255
    t.string   "addr_unit",         limit: 255
    t.string   "osm_id",            limit: 255
    t.boolean  "atm"
    t.string   "source",            limit: 255
    t.integer  "business_type"
    t.integer  "chain_id"
    t.string   "city",              limit: 255
    t.string   "region",            limit: 255
    t.float    "rating"
    t.string   "nearest_station",   limit: 255
    t.boolean  "airport"
    t.string   "directory",         limit: 255
    t.boolean  "accessible"
    t.integer  "upload_id"
    t.integer  "admin_user_id"
    t.string   "logo",              limit: 255
    t.string   "currency",          limit: 255
    t.integer  "rates_source"
    t.boolean  "contract"
    t.string   "delivery_tracking"
    t.integer  "rates_policy"
    t.string   "caption"
  end

  add_index "exchanges", ["chain_id"], name: "index_exchanges_on_chain_id", using: :btree
  add_index "exchanges", ["latitude", "longitude"], name: "index_exchanges_on_latitude_and_longitude", using: :btree
  add_index "exchanges", ["latitude"], name: "index_exchanges_on_latitude", using: :btree
  add_index "exchanges", ["longitude"], name: "index_exchanges_on_longitude", using: :btree
  add_index "exchanges", ["name", "address"], name: "index_exchanges_on_name_and_address", using: :btree

  create_table "orders", force: :cascade do |t|
    t.integer  "exchange_id"
    t.integer  "user_id"
    t.datetime "expiry"
    t.integer  "status",                        default: 0
    t.integer  "pay_cents"
    t.string   "pay_currency",      limit: 255
    t.integer  "buy_cents"
    t.string   "buy_currency",      limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "service_type"
    t.integer  "get_cents"
    t.string   "get_currency"
    t.string   "user_location"
    t.string   "customer_email"
    t.string   "customer_phone"
    t.string   "customer_address1"
    t.string   "customer_address2"
    t.string   "customer_address3"
  end

  add_index "orders", ["exchange_id"], name: "index_orders_on_exchange_id", using: :btree
  add_index "orders", ["user_id"], name: "index_orders_on_user_id", using: :btree

  create_table "rates", force: :cascade do |t|
    t.integer  "source"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "ratable_id"
    t.string   "ratable_type",  limit: 255
    t.integer  "service_type"
    t.string   "currency",      limit: 255
    t.float    "buy"
    t.float    "sell"
    t.integer  "admin_user_id"
    t.datetime "last_update"
  end

  add_index "rates", ["admin_user_id"], name: "index_rates_on_admin_user_id", using: :btree
  add_index "rates", ["ratable_id", "ratable_type"], name: "index_rates_on_ratable_id_and_ratable_type", using: :btree

  create_table "s_currencies", force: :cascade do |t|
    t.integer  "source_id"
    t.string   "name",       limit: 255
    t.string   "iso_code",   limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "s_currencies", ["source_id"], name: "index_s_currencies_on_source_id", using: :btree

  create_table "searches", force: :cascade do |t|
    t.string   "pay_currency",   limit: 255
    t.string   "buy_currency",   limit: 255
    t.string   "pay_amount",     limit: 255
    t.string   "buy_amount",     limit: 255
    t.string   "location",       limit: 255
    t.string   "user_lat",       limit: 255
    t.string   "user_lng",       limit: 255
    t.string   "user_location",  limit: 255
    t.decimal  "distance"
    t.string   "distance_unit",  limit: 255
    t.string   "sort",           limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "page",           limit: 255
    t.string   "rest",           limit: 255
    t.string   "location_short", limit: 255
    t.string   "email",          limit: 255
    t.string   "host",           limit: 255
    t.integer  "exchange_id"
    t.float    "location_lat"
    t.float    "location_lng"
    t.string   "location_type",  limit: 255
    t.integer  "service_type",               default: 0
  end

  add_index "searches", ["exchange_id"], name: "index_searches_on_exchange_id", using: :btree

  create_table "sources", force: :cascade do |t|
    t.text     "url"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "uploads", force: :cascade do |t|
    t.integer  "source_type"
    t.string   "file_location",   limit: 255
    t.string   "file_name",       limit: 255
    t.integer  "records_created"
    t.integer  "records_updated"
    t.integer  "admin_user_id"
    t.datetime "upload_start"
    t.datetime "upload_finished"
    t.integer  "upload_status"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "uploads", ["admin_user_id"], name: "index_uploads_on_admin_user_id", using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "email",                  limit: 255, default: "", null: false
    t.string   "encrypted_password",     limit: 255, default: "", null: false
    t.string   "reset_password_token",   limit: 255
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                      default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "buy_currency",           limit: 255
    t.string   "pay_currency",           limit: 255
    t.string   "provider",               limit: 255
    t.string   "uid",                    limit: 255
    t.string   "name",                   limit: 255
    t.string   "image",                  limit: 255
    t.string   "location",               limit: 255
    t.string   "first_name",             limit: 255
    t.string   "last_name",              limit: 255
    t.string   "gender",                 limit: 255
    t.string   "timezone",               limit: 255
    t.string   "locale",                 limit: 255
    t.boolean  "guest"
    t.string   "landing",                limit: 255
    t.string   "buy_amount",             limit: 255
    t.string   "pay_amount",             limit: 255
    t.float    "latitude"
    t.float    "longitude"
    t.float    "bbox"
    t.string   "location_search",        limit: 255
    t.string   "geocoded_location",      limit: 255
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  create_table "visitors", force: :cascade do |t|
    t.integer  "buy_cents"
    t.string   "buy_currency", limit: 255
    t.integer  "pay_cents"
    t.string   "pay_currency", limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "email",        limit: 255
  end

end
