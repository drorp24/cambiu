class Api::V1::BaseController < ActionController::Base
	# before_filter :authenticate_user_from_token!
	# skip_before_filter :verify_authenticity_token,:if => Proc.new { |c| c.request.format == 'application/json' }
	respond_to :json

	private
		#https://gist.github.com/josevalim/fb706b1e933ef01e4fb6
	  def authenticate_user_from_token!
	    user_email = request.headers[:useremail].presence
	    authentication_token = request.headers[:usertoken].presence # request.headers
	    user  = user_email && User.find_by_email(user_email)

	    if user && Devise.secure_compare(user.authentication_token, authentication_token)
	      sign_in user, store: false
	      @current_user = user
	    else
	    	return invalid_login_attempt
	    end
	  end

    def current_user
    	@current_user
    end

    def current_center
    	current_center = @current_user.centers.where(id:params[:center_id]).first
    	raise CanCan::AccessDenied.new() if current_center.blank?
    	current_center
    end

	  def invalid_login_attempt
	    render json: { success: false, message: "Error with your login or password"}, status: :unauthorized
	  end
end