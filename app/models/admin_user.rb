class AdminUser < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable,
         :recoverable, :trackable, :validatable


=begin
  def timeout_in
    # can dynamically change it by user
    30.minutes
  end
=end

end
