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

ActiveRecord::Schema.define(version: 20150127205400) do

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

  create_table "exchanges", force: true do |t|
    t.string   "name"
    t.string   "address"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.float    "latitude"
    t.float    "longitude"
    t.string   "country"
    t.float    "user_ratings"
    t.time     "opens"
    t.time     "closes"
    t.string   "website"
    t.boolean  "wheelchair"
    t.string   "email"
    t.text     "note"
    t.text     "opening_hours"
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
  end

end
