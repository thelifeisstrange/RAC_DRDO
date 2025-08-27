# advertisements/api.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Advertisement
# Import the powerful worker functions we just created
from .table_manager import create_results_table_for_advertisement, save_results_to_table

class AdvertisementAPIView(APIView):
    """
    Handles listing existing advertisements and creating new ones.
    This is the first endpoint the frontend will call.
    """
    def get(self, request, *args, **kwargs):
        # Fetch all ads from the database
        ads = Advertisement.objects.all().order_by('-created_at')
        # Serialize them into a simple list of dictionaries for the frontend
        data = [{'id': ad.id, 'name': ad.name} for ad in ads]
        return Response(data)

    def post(self, request, *args, **kwargs):
        """
        Creates a new advertisement record.
        This does NOT create the results table yet. That happens when data is saved.
        """
        name = request.data.get('name')
        if not name:
            return Response({'error': 'Advertisement name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Use get_or_create to prevent creating duplicate ads with the same name
        ad, created = Advertisement.objects.get_or_create(name=name)
        
        if created:
            print(f"[API] Created new advertisement: '{name}' with ID: {ad.id}")
            return Response({'id': ad.id, 'name': ad.name}, status=status.HTTP_201_CREATED)
        else:
            print(f"[API] Found existing advertisement: '{name}' with ID: {ad.id}")
            return Response({'id': ad.id, 'name': ad.name}, status=status.HTTP_200_OK)


class SaveAdvertisementResultsAPIView(APIView):
    """
    This is the main endpoint for saving the final, verified data.
    It orchestrates the entire dynamic table creation and data insertion process.
    """
    def post(self, request, *args, **kwargs):
        advertisement_id = request.data.get('advertisement_id')
        results_list = request.data.get('results', [])

        if not advertisement_id:
            return Response({'error': 'An advertisement_id is required to save results.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Step 1: Find the parent advertisement
            advertisement = Advertisement.objects.get(id=advertisement_id)
            table_name = advertisement.get_results_table_name()

            # Step 2: Call the table manager to create the dynamic table
            success, error = create_results_table_for_advertisement(table_name)
            if not success:
                # If table creation fails, it's a critical server error
                return Response({'error': f'Database error: {error}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Step 3: Call the table manager to save the data
            saved_count, errors = save_results_to_table(table_name, results_list)
            
            if errors:
                # Return a multi-status response if some rows failed to save
                return Response({
                    'status': f'Partial success. Saved {saved_count} of {len(results_list)} results.',
                    'errors': errors
                }, status=status.HTTP_207_MULTI_STATUS)

            return Response({'status': f'Successfully saved {saved_count} results to table {table_name}.'}, status=status.HTTP_200_OK)

        except Advertisement.DoesNotExist:
            return Response({'error': f'Advertisement with ID {advertisement_id} not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'An unexpected server error occurred: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class BulkSaveResultsAPIView(APIView):
    def post(self, request, *args, **kwargs):
        advertisement_id = request.data.get('advertisement_id')
        results_list = request.data.get('results', [])

        if not advertisement_id:
            return Response({'error': 'Advertisement ID is required.'}, status=400)
        
        try:
            advertisement = Advertisement.objects.get(id=advertisement_id)
        except Advertisement.DoesNotExist:
            return Response({'error': 'Advertisement not found.'}, status=404)

        # --- THE NEW ORCHESTRATION LOGIC ---
        table_name = advertisement.get_results_table_name()
        
        # Step 1: Create the dynamic table for this advertisement
        table_created, error = create_results_table_for_advertisement(table_name)
        if not table_created:
            return Response({'error': f'Database error: {error}'}, status=500)
            
        # Step 2: Save the data to the newly created table
        saved_count, errors = save_results_to_table(table_name, results_list)
        
        if errors:
            return Response({
                'status': f'Partial success. Saved {saved_count} results.',
                'errors': errors
            }, status=207)

        return Response({'status': f'Successfully saved {saved_count} results to new table {table_name}.'}, status=200)