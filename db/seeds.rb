# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
SCurrency.create(name: "EURO Euro", iso_code: "EUR" )
SCurrency.create(name: "U.S.A Dollar", iso_code: "USD" )
SCurrency.create(name: "Australia Dollar", iso_code: "AUD" )
SCurrency.create(name: "Canada Dollar", iso_code: "CAD" )
