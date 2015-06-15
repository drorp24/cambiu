class ExchangesController < ApplicationController 

=begin
  before_action :set_http_cache_headers, only: [:index]     # quicker next rendering  (return 304 instead of page)
  caches_action :index                                      # quicker first rendering (pick-up ready page from cache)

=end
  def show
    @exchange = Exchange.new
  end


=begin
  def index
    @user = User.new
  end
    
  def search                                # TODO: eager loading, performance improvement                   
    @exchanges = Exchange.search(params)    # TODO: Error checking etc
    render json: @exchanges
  end

  def quote # remember to change to params[:id]
    return unless params[:id] && params[:buy_amount] && params[:buy_currency] && params[:pay_currency]
    exchange = Exchange.find(434)
    pay = exchange.quote(params[:buy_amount], params[:buy_currency], params[:pay_currency])
    render json: pay
  end
=end

  def exchange_params
    params.require(:exchange).permit!
  end
      
end